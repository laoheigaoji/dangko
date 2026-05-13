import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import TurnoverItem from "./src/models/TurnoverItem.ts";
import BuyItem from "./src/models/BuyItem.ts";
import User from "./src/models/User.ts";
import Settings from "./src/models/Settings.ts";
import nodemailer from "nodemailer";

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
    const items = await TurnoverItem.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(items);
  });
  app.get("/api/turnover/:id", async (req, res) => {
    const item = await TurnoverItem.findById(req.params.id);
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
    const items = await BuyItem.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(items);
  });
  app.get("/api/buy/:id", async (req, res) => {
    const item = await BuyItem.findById(req.params.id);
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
      res.status(201).json({ user: { id: user._id, phone: user.phone, isVip: user.isVip, email: user.email } });
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
      res.json({ user: { id: user._id, phone: user.phone, isVip: user.isVip } });
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

  // Settings
  app.get("/api/settings/smtp", async (req, res) => {
    const smtp = await Settings.findOne({ key: "smtp" });
    res.json(smtp ? smtp.value : null);
  });

  // Initialize Default SMTP if not exists
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
  }
  initSettings();

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
