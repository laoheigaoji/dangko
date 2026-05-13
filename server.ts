import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import _TurnoverItem from "./src/models/TurnoverItem";
import _BuyItem from "./src/models/BuyItem";
import _User from "./src/models/User";
import _Settings from "./src/models/Settings";
import _Order from "./src/models/Order";

const TurnoverItem = _TurnoverItem as any;
const BuyItem = _BuyItem as any;
const User = _User as any;
const Settings = _Settings as any;
const Order = _Order as any;

import nodemailer from "nodemailer";
import { AlipaySdk } from "alipay-sdk";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MongoDB connection (Non-blocking start)
  const MONGODB_URI = "mongodb+srv://752675:Aa752675@cluster0.simmm5o.mongodb.net/dangkou";
  
  mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to MongoDB successfully");
    
    // Seed data if empty
    try {
      const turnoverCount = await TurnoverItem.countDocuments();
      if (turnoverCount === 0) {
        await TurnoverItem.insertMany([
          { shopName: '三鼠', originalPrice: 1248, transferPrice: 1130, userName: '用户1418', description: '高性价比', views: 8, wx: '13544409629', qq: '2522747697', status: 'approved' },
          { shopName: '本色', originalPrice: 60, transferPrice: 50, userName: '用户5907', description: '没有货款，只有裤子1015一条', views: 2, status: 'approved' },
        ]);
        console.log("Turnover items seeded");
      }
      
      const buyCount = await BuyItem.countDocuments();
      if (buyCount === 0) {
        await BuyItem.insertMany([
          { shopName: '缤客', requestAmount: 100000, userName: '用户3191', remark: '多少都收', phone: '17322023191', status: 'approved' },
        ]);
        console.log("Buy items seeded");
      }

      // Seed admin user with upsert to ensure credentials
      await User.findOneAndUpdate(
        { phone: "admin" },
        { 
          phone: "admin", 
          password: "admin888", 
          isVip: true 
        },
        { upsert: true, new: true }
      );
      console.log("Admin user 'admin' with password 'admin888' is ready");

      // Initialize Default SMTP if not exists
      const existingSmtp = await Settings.findOne({ key: "smtp" });
      if (!existingSmtp) {
        await Settings.findOneAndUpdate(
          { key: "smtp" },
          { 
            value: { 
              host: "smtp.qq.com", 
              port: "465", 
              user: "1546912750@qq.com", 
              password: "cdsoxmjsuolohjci", // Note: field was 'pass' in some places, 'password' here? Checking...
              pass: "cdsoxmjsuolohjci",
              from: "1546912750@qq.com" 
            } 
          },
          { upsert: true }
        );
        console.log("Default SMTP configured");
      }
    } catch (seedErr) {
      console.error("Error during seeding:", seedErr);
    }
  }).catch(err => {
    console.error("Failed to connect to MongoDB", err);
  });

  // Middleware
  app.use(express.json());

  // Check DB connection middleware for API routes
  app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1 && req.path !== "/health") {
      return res.status(503).json({ 
        error: "Database not connected", 
        message: "Database connection failed. Please check the hardcoded connection string in server.ts." 
      });
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState });
  });

  // Notification Helper
  async function notifySubscribers(shopName: string, type: 'turnover' | 'buy', data: any) {
    const smtpSetting = await Settings.findOne({ key: "smtp" });
    if (!smtpSetting) return;

    const users = await User.find({
      "subscriptions.shopName": shopName,
      $or: [
        { "subscriptions.turnover": true, "subscriptions.shopName": shopName },
        { "subscriptions.buy": true, "subscriptions.shopName": shopName }
      ]
    });

    const { host, port, user, pass, from } = smtpSetting.value;
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    for (const u of users) {
      if (!u.email) continue;
      
      const sub = u.subscriptions.find((s: any) => s.shopName === shopName);
      if (type === 'turnover' && !sub?.turnover) continue;
      if (type === 'buy' && !sub?.buy) continue;

      const subject = `[新消息] 您订阅的档口 ${shopName} 有新的${type === 'turnover' ? '转让' : '求购'}信息`;
      const text = `档口: ${shopName}\n类型: ${type === 'turnover' ? '转让' : '求购'}\n发布者: ${data.userName}\n金额/价格: ${type === 'turnover' ? data.transferPrice : data.requestAmount}\n详情请见平台。`;

      try {
        await transporter.sendMail({ from, to: u.email, subject, text });
      } catch (err) {
        console.error(`Failed to notify ${u.email}`, err);
      }
    }
  }

  app.get("/api/turnover", async (req, res) => {
    const { search } = req.query;
    const filter: any = { status: 'approved' };
    
    if (search) {
      filter.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await TurnoverItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  });
  app.get("/api/turnover/:id", async (req, res) => {
    const item = await TurnoverItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    const favoritesCount = await User.countDocuments({ favorites: req.params.id });
    res.json({ ...item.toObject(), favoritesCount });
  });
  app.patch("/api/turnover/:id/view", async (req, res) => {
    const item = await TurnoverItem.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(item);
  });
  app.post("/api/turnover", async (req, res) => {
    const item = new TurnoverItem({ ...req.body, status: 'pending' });
    await item.save();
    res.status(201).json(item);
  });
  app.delete("/api/turnover/:id", async (req, res) => {
    await TurnoverItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/buy", async (req, res) => {
    const { search } = req.query;
    const filter: any = { status: 'approved' };
    
    if (search) {
      filter.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { remark: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await BuyItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  });
  app.get("/api/buy/:id", async (req, res) => {
    const item = await BuyItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    const favoritesCount = await User.countDocuments({ favorites: req.params.id });
    res.json({ ...item.toObject(), favoritesCount });
  });
  app.patch("/api/buy/:id/view", async (req, res) => {
    const item = await BuyItem.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(item);
  });
  app.post("/api/buy", async (req, res) => {
    const item = new BuyItem({ ...req.body, status: 'pending' });
    await item.save();
    res.status(201).json(item);
  });
  app.delete("/api/buy/:id", async (req, res) => {
    await BuyItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  });

  // Auth and Users
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { phone, password, email, code } = req.body;
      if (phone === "admin") return res.status(400).json({ error: "保留账号，不可注册" });
      const existingUser = await User.findOne({ phone });
      if (existingUser) return res.status(400).json({ error: "该账号已存在，请直接登录" });

      if (email && code) {
        if (verificationCodes.get(email) !== code) {
          return res.status(400).json({ error: "验证码错误" });
        }
        verificationCodes.delete(email);
      } else {
        return res.status(400).json({ error: "请填写邮箱并验证" });
      }

      const user = new User({ phone, password, email });
      await user.save();
      res.status(201).json({ user: { id: user._id, phone: user.phone, isVip: user.isVip, hasRoi: user.hasRoi, hasPublish: user.hasPublish, email: user.email } });
    } catch (e) {
      res.status(500).json({ error: "注册失败，请稍后再试" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    console.log("Login request received:", req.body.phone);
    try {
      const { phone, password } = req.body;
      const user = await User.findOne({ phone });
      if (!user) {
        console.log("User not found:", phone);
        return res.status(404).json({ error: "账号不存在，请先注册" });
      }
      if (user.password !== password) {
        console.log("Password incorrect for user:", phone);
        return res.status(401).json({ error: "密码错误，请重新输入" });
      }
      console.log("Login successful:", phone);
      res.json({ user: { 
        id: user._id, 
        phone: user.phone, 
        isVip: user.isVip,
        hasRoi: user.hasRoi,
        hasPublish: user.hasPublish
      } });
    } catch (e) {
      console.error("Login error:", e);
      res.status(500).json({ error: "登录失败，请稍后再试" });
    }
  });

  app.get("/api/users", async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  });

  app.put("/api/users/:id", async (req, res) => {
    const { phone, isVip, email, wx, qq, favorites, subscriptions } = req.body;
    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (isVip !== undefined) updateData.isVip = isVip;
    if (email !== undefined) updateData.email = email;
    if (wx !== undefined) updateData.wx = wx;
    if (qq !== undefined) updateData.qq = qq;
    if (favorites !== undefined) updateData.favorites = favorites;
    if (subscriptions !== undefined) updateData.subscriptions = subscriptions;
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(user);
  });

  app.put("/api/users/:id/vip", async (req, res) => {
    const { isVip } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isVip }, { new: true });
    res.json(user);
  });

  app.put("/api/users/:id/password", async (req, res) => {
    const { password } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { password }, { new: true });
    res.json({ success: true });
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
  });

  app.get("/api/users/:phone/turnover", async (req, res) => {
    const items = await TurnoverItem.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(items);
  });

  app.get("/api/users/:phone/buy", async (req, res) => {
    const items = await BuyItem.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(items);
  });

  app.post("/api/users/:id/favorites", async (req, res) => {
    const { itemId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.favorites.includes(itemId)) {
      user.favorites = user.favorites.filter((id: string) => id !== itemId);
    } else {
      user.favorites.push(itemId);
    }
    await user.save();
    res.json(user);
  });

  app.post("/api/users/:id/subscriptions", async (req, res) => {
    const { shopName, turnover, buy } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const existingIndex = user.subscriptions.findIndex((s: any) => s.shopName === shopName);
    if (existingIndex > -1) {
      user.subscriptions[existingIndex] = { shopName, turnover, buy };
    } else {
      user.subscriptions.push({ shopName, turnover, buy });
    }
    
    await user.save();
    res.json(user);
  });

  app.delete("/api/users/:id/subscriptions/:shopName", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.subscriptions = user.subscriptions.filter((s: any) => s.shopName !== req.params.shopName);
    await user.save();
    res.json(user);
  });

  app.get("/api/admin/turnover", async (req, res) => {
    const items = await TurnoverItem.find().sort({ createdAt: -1 });
    res.json(items);
  });
  app.get("/api/admin/buy", async (req, res) => {
    const items = await BuyItem.find().sort({ createdAt: -1 });
    res.json(items);
  });

  // Admin Approval Routes
  app.get("/api/admin/pending", async (req, res) => {
    const turnover = await TurnoverItem.find({ status: 'pending' }).sort({ createdAt: -1 });
    const buy = await BuyItem.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ turnover, buy });
  });

  app.post("/api/admin/approve/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const status = action === 'approve' ? 'approved' : 'rejected';

    if (type === 'turnover') {
      const item = await TurnoverItem.findByIdAndUpdate(id, { status }, { new: true });
      if (item && status === 'approved') {
        notifySubscribers(item.shopName, 'turnover', item);
      }
      res.json(item);
    } else {
      const item = await BuyItem.findByIdAndUpdate(id, { status }, { new: true });
      if (item && status === 'approved') {
        notifySubscribers(item.shopName, 'buy', item);
      }
      res.json(item);
    }
  });

  app.get("/api/settings/vip-plans", async (req, res) => {
    const plans = await Settings.findOne({ key: "vip_plans" });
    res.json(plans ? plans.value : []);
  });

  app.post("/api/settings/vip-plans", async (req, res) => {
    const { plans } = req.body;
    await Settings.findOneAndUpdate(
      { key: "vip_plans" },
      { value: plans },
      { upsert: true }
    );
    res.json({ success: true });
  });

  // Settings
  app.get("/api/settings/notice", async (req, res) => {
    const notice = await Settings.findOne({ key: "notice" });
    res.json(notice ? notice.value : null);
  });

  app.post("/api/settings/notice", async (req, res) => {
    const { enabled, title, content, date } = req.body;
    await Settings.findOneAndUpdate(
      { key: "notice" },
      { value: { enabled, title, content, date } },
      { upsert: true }
    );
    res.json({ success: true });
  });

  app.get("/api/settings/smtp", async (req, res) => {
    const smtp = await Settings.findOne({ key: "smtp" });
    res.json(smtp ? smtp.value : null);
  });

  // Initialize Default Settings if not exists
  async function initSettings() {
    const existing = await Settings.findOne({ key: "smtp" });
    if (!existing) {
      await Settings.findOneAndUpdate(
        { key: "smtp" },
        { 
          value: { 
            host: "smtp.qq.com", 
            port: "465", 
            user: "1546912750@qq.com", 
            pass: "cdsoxmjsuolohjci", 
            from: "1546912750@qq.com" 
          } 
        },
        { upsert: true }
      );
      console.log("Default SMTP configured");
    }

    const noticeExisting = await Settings.findOne({ key: "notice" });
    if (!noticeExisting) {
      await Settings.findOneAndUpdate(
        { key: "notice" },
        { 
          value: { 
            enabled: true,
            title: "新增订阅档口功能",
            content: "登录后在个人中心添加订阅档口，有该档口信息发布时将自动邮件通知您。",
            date: "2026-05-05"
          } 
        },
        { upsert: true }
      );
      console.log("Default Notice configured");
    }

    const vipPlansExisting = await Settings.findOne({ key: "vip_plans" });
    if (!vipPlansExisting) {
      await Settings.findOneAndUpdate(
        { key: "vip_plans" },
        { 
          value: [
            { id: 'month', name: '月度会员', price: '19.9', label: '尝鲜首选', popular: false },
            { id: 'quarter', name: '季度会员', price: '39.9', label: '超值推荐', popular: true },
            { id: 'year', name: '年度会员', price: '88', label: '长期经营', popular: false },
            { id: 'forever', name: '永久会员', price: '188', label: '终身买断', popular: false },
          ]
        },
        { upsert: true }
      );
      console.log("Default VIP Plans configured");
    }
    const alipayExisting = await Settings.findOne({ key: "alipay" });
    if (!alipayExisting) {
      await Settings.findOneAndUpdate(
        { key: "alipay" },
        { 
          value: { 
            appId: "", 
            privateKey: "", 
            alipayPublicKey: "",
            sandbox: true
          } 
        },
        { upsert: true }
      );
      console.log("Default Alipay settings configured");
    }
  }
  initSettings();

  app.get("/api/settings/alipay", async (req, res) => {
    const alipay = await Settings.findOne({ key: "alipay" });
    res.json(alipay ? alipay.value : {});
  });

  app.post("/api/settings/alipay", async (req, res) => {
    const { appId, privateKey, alipayPublicKey, sandbox } = req.body;
    await Settings.findOneAndUpdate(
      { key: "alipay" },
      { value: { appId, privateKey, alipayPublicKey, sandbox } },
      { upsert: true }
    );
    res.json({ success: true });
  });

  // Helper to get Alipay SDK instance
  async function getAlipaySdk() {
    const setting = await Settings.findOne({ key: "alipay" });
    if (!setting || !setting.value.appId || !setting.value.privateKey) {
      return null;
    }
    return new AlipaySdk({
      appId: setting.value.appId,
      privateKey: setting.value.privateKey,
      alipayPublicKey: setting.value.alipayPublicKey,
      gateway: setting.value.sandbox ? "https://openapi.alipaydev.com/gateway.do" : "https://openapi.alipay.com/gateway.do"
    });
  }

  app.post("/api/payment/alipay", async (req, res) => {
    try {
      const { userId, planId, type } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const plansSetting = await Settings.findOne({ key: "vip_plans" });
      const plan = plansSetting.value.find((p: any) => p.id === planId);
      if (!plan) return res.status(400).json({ error: "Invalid plan" });

      const alipaySdk = await getAlipaySdk();
      if (!alipaySdk) {
        // Mock payment for demo if no keys configured
        const outTradeNo = `MOCK_${Date.now()}`;
        const order = new Order({
          userId: user._id,
          planId,
          type: type || "publish",
          amount: Number(plan.price),
          status: "pending",
          outTradeNo
        });
        await order.save();
        return res.json({ mock: true, outTradeNo });
      }

      const outTradeNo = `ALIPAY_${Date.now()}`;
      const order = new Order({
        userId: user._id,
        planId,
        type: type || "publish",
        amount: Number(plan.price),
        status: "pending",
        outTradeNo
      });
      await order.save();

      const subject = type === 'roi' ? `ROI工具箱 - ${plan.name}` : `发布权限 - ${plan.name}`;
      const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
        bizContent: {
          out_trade_no: outTradeNo,
          product_code: 'FAST_INSTANT_TRADE_PAY',
          total_amount: plan.price,
          subject: subject,
        },
        returnUrl: `${req.protocol}://${req.get('host')}/payment/success`,
        notifyUrl: `${req.protocol}://${req.get('host')}/api/payment/alipay/notify`,
      } as any, { method: 'GET' });

      res.json({ url: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mock payment confirmation endpoint
  app.post("/api/payment/mock-confirm", async (req, res) => {
    const { outTradeNo } = req.body;
    const order = await Order.findOne({ outTradeNo });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    const update: any = {};
    if (order.type === 'roi') {
      update.hasRoi = true;
    } else if (order.type === 'publish') {
      update.hasPublish = true;
    } else {
      update.isVip = true;
      update.hasRoi = true;
      update.hasPublish = true;
    }
    
    await User.findByIdAndUpdate(order.userId, update);
    res.json({ success: true });
  });

  app.post("/api/payment/alipay/notify", async (req, res) => {
    try {
      const alipaySdk = await getAlipaySdk();
      if (!alipaySdk) return res.send("failure");

      const result = alipaySdk.checkNotifySign(req.body);
      if (result) {
        const { out_trade_no, trade_status, trade_no } = req.body;
        if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
          const order = await Order.findOne({ outTradeNo: out_trade_no });
          if (order && order.status !== 'paid') {
            order.status = 'paid';
            order.tradeNo = trade_no;
            order.paidAt = new Date();
            await order.save();

            const update: any = {};
            if (order.type === 'roi') {
              update.hasRoi = true;
            } else if (order.type === 'publish') {
              update.hasPublish = true;
            } else {
              update.isVip = true;
              update.hasRoi = true;
              update.hasPublish = true;
            }
            await User.findByIdAndUpdate(order.userId, update);
          }
        }
        res.send("success");
      } else {
        res.send("failure");
      }
    } catch (e) {
      res.send("failure");
    }
  });

  app.post("/api/settings/smtp", async (req, res) => {
    const { host, port, user, pass, from } = req.body;
    await Settings.findOneAndUpdate(
      { key: "smtp" },
      { value: { host, port, user, pass, from } },
      { upsert: true }
    );
    res.json({ success: true });
  });

  // Verification Code
  const verificationCodes = new Map<string, string>();

  app.post("/api/auth/send-code", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const smtpSetting = await Settings.findOne({ key: "smtp" });
    if (!smtpSetting) return res.status(500).json({ error: "SMTP not configured" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, code);

    const { host, port, user, pass, from } = smtpSetting.value;
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: "验证码 - 新塘档口平台",
        text: `您的验证码是: ${code}。有效时间5分钟。`,
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "邮件发送失败" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
