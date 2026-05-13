import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/", { state: { showProfileReminder: true } });
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("登录失败，请检查网络连接");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4cc9f0] via-[#48bcae] to-[#70e000] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[12px] p-6 w-full max-w-[360px] shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8 mt-2">
          <h1 className="text-[19px] font-black text-[#333] mb-2 tracking-wider">新塘档口余额互转平台</h1>
          <p className="text-[13px] text-[#999]">安全便捷的余额转让服务</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-[#f0f0f0] rounded-[6px] py-2.5 px-3 text-[14px] outline-none focus:border-[#528add] transition-colors placeholder:text-[#ccc] text-[#333]"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
                <span className="text-[#3b5998] text-[20px] font-serif transform -rotate-12 translate-y-1">0</span>
                <span className="text-[#8b4242] text-[22px] font-serif transform rotate-12 -translate-y-1">5</span>
                <span className="text-[#20498a] text-[18px] font-serif transform -rotate-6 translate-y-1">6</span>
                <span className="text-[#428b8b] text-[24px] font-serif transform rotate-6">7</span>
              </div>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="20" x2="85" y2="28" stroke="#a05050" strokeWidth="1" />
                <line x1="10" y1="30" x2="80" y2="15" stroke="#5050a0" strokeWidth="1" />
                {[...Array(15)].map((_, i) => (
                  <circle key={i} cx={Math.random() * 90} cy={Math.random() * 42} r="0.5" fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                ))}
              </svg>
            </div>
          </div>

          {error && <div className="text-red-500 text-[13px] text-center my-2 bg-red-50 py-1.5 rounded">{error}</div>}

          <button onClick={handleLogin} className="w-full bg-[#528add] hover:bg-[#4379c7] text-white rounded-[6px] py-2.5 text-[15px] font-normal mt-2 active:scale-[0.98] transition-transform">
            登录
          </button>
        </div>

        <div className="flex justify-center items-center mt-6 mb-2 text-[13px]">
          <Link to="#" className="text-[#648bc0] hover:text-[#528add]">忘记密码?</Link>
          <span className="text-[#eee] mx-4">|</span>
          <Link to="/register" className="text-[#648bc0] hover:text-[#528add]">没有账号? 去注册</Link>
        </div>
      </div>
    </div>
  );
}
