import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendCode = async () => {
    if (!email) return setError("请先输入邮箱");
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!email || !code) return setError("请完成邮箱验证");
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, email, code })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/", { state: { showProfileReminder: true } });
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("注册失败，请检查网络连接");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4cc9f0] via-[#48bcae] to-[#70e000] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[12px] p-6 w-full max-w-[360px] shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8 mt-2">
          <h1 className="text-[19px] font-black text-[#333] mb-2 tracking-wider">新塘档口余额互转平台</h1>
          <p className="text-[13px] text-[#999]">创建账号，开始使用</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="手机号 (作为登录账号)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
          />
          <input
            type="email"
            placeholder="常用邮箱 (接收订阅通知)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="邮箱验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
            />
            <button 
              onClick={sendCode}
              disabled={sending || countdown > 0}
              className="px-3 bg-gray-100 text-gray-600 rounded-[6px] text-xs font-medium disabled:opacity-50 min-w-[100px]"
            >
              {countdown > 0 ? `${countdown}s后重发` : (sending ? "发送中..." : "获取验证码")}
            </button>
          </div>
          <input
            type="password"
            placeholder="登录密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
          />
          <input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
          />

          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="验证码"
              className="flex-1 border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333] w-0"
            />
            <div className="w-[90px] h-[42px] border border-[#f0f0f0] rounded-[6px] flex items-center justify-center bg-white relative overflow-hidden flex-shrink-0 cursor-pointer">
              {/* Simulated Captcha */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-90 pointer-events-none">
                <span className="text-[#593b22] text-[22px] font-serif transform rotate-12 -translate-y-1">0</span>
                <span className="text-[#722031] text-[18px] font-serif transform -rotate-12 translate-y-1">2</span>
                <span className="text-[#3b1259] text-[24px] font-serif transform rotate-6">4</span>
                <span className="text-[#202059] text-[20px] font-serif transform -rotate-12 -translate-y-1">4</span>
              </div>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="15" x2="80" y2="35" stroke="#602828" strokeWidth="1" />
                <line x1="20" y1="35" x2="80" y2="10" stroke="#332a68" strokeWidth="1" />
                {[...Array(15)].map((_, i) => (
                  <circle key={i} cx={Math.random() * 90} cy={Math.random() * 42} r="0.5" fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                ))}
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" id="terms" className="w-3.5 h-3.5 rounded-sm border-[#dcdfe6] text-[#528add] focus:ring-[#528add] cursor-pointer" />
            <label htmlFor="terms" className="text-[12px] text-[#666] select-none cursor-pointer">
              我已阅读并同意 <Link to="#" className="text-[#648bc0] hover:text-[#528add]">服务政策</Link> 和 <Link to="#" className="text-[#648bc0] hover:text-[#528add]">隐私条款</Link>
            </label>
          </div>

          {error && <div className="text-red-500 text-[13px] text-center my-2 bg-red-50 py-1.5 rounded">{error}</div>}

          <button onClick={handleRegister} className="w-full bg-[#528add] hover:bg-[#4379c7] text-white rounded-[6px] py-2.5 text-[15px] font-normal mt-2 active:scale-[0.98] transition-transform">
            注册
          </button>
        </div>

        <div className="flex justify-center items-center mt-6 mb-2 text-[13px]">
          <Link to="/login" className="text-[#648bc0] hover:text-[#528add]">已有账号? 去登录</Link>
        </div>
      </div>
    </div>
  );
}
