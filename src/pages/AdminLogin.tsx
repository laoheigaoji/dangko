import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      setError("请输入密码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.phone !== "admin") {
          setError("非管理员账号");
          return;
        }
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        window.location.href = "/admin";
      } else {
        setError(data.error || "账号或密码错误");
      }
    } catch (e) {
      setError("登录失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-sm">
        <h1 className="text-[20px] font-bold text-center mb-6 text-[#333]">管理员后台登录</h1>
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <input
            type="text"
            placeholder="账号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-[#e0e0e0] rounded-[8px] px-4 py-3 text-[14px] outline-none focus:border-[#4b8cd9]"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border border-[#e0e0e0] rounded-[8px] px-4 py-3 text-[14px] outline-none focus:border-[#4b8cd9]"
          />
          {error && <div className="text-red-500 text-[13px] text-center my-2 bg-red-50 py-1.5 rounded animate-pulse">{error}</div>}
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#4b8cd9] text-white rounded-[8px] py-3 text-[15px] font-medium hover:bg-[#3d7ac5] transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "正在登录..." : "进入后台"}
          </button>
        </div>
      </div>
    </div>
  );
}
