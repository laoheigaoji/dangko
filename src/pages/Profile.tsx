import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/unauthorized');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const menuItems = [
    { name: "修改资料", emoji: "📝", path: "/profile/edit", bg: "bg-[#fffdf0]", border: "border-[#fcebc4]" },
    { name: "我的转让", emoji: "📦", path: "/profile/turnover", bg: "bg-[#f0f7fe]", border: "border-[#e2effa]" },
    { name: "我的求购", emoji: "🛒", path: "/profile/buy", bg: "bg-[#f0fcf2]", border: "border-[#d8f2da]" },
    { name: "我的收藏", emoji: "❤️", path: "/profile/favorites", bg: "bg-[#fff0f0]", border: "border-[#ffe0e0]" },
    { name: "订阅档口", emoji: "🔔", path: "/profile/subscriptions", bg: "bg-[#f0efff]", border: "border-[#dcd9fa]" },
  ];

  if (!user) return null;

  return (
    <div className="pb-20 min-h-screen bg-[#f5f6f8] font-sans">
      <div className="bg-gradient-to-br from-[#5978f5] to-[#8b55b7] pt-[40px] pb-[20px] px-4 text-white text-center rounded-b-[20px] shadow-sm relative overflow-hidden">
        <h1 className="text-[28px] font-black mb-2 tracking-wider" style={{textShadow: "0 2px 4px rgba(0,0,0,0.15)"}}>用户</h1>
        <p className="text-[14px] opacity-90 tracking-wide font-light">{user.phone}</p>
        <div className="flex flex-col gap-1 mt-2">
            <p className="text-[11px] opacity-90">
                {user.hasPublish || user.isVip ? '✅ 已开通发布权限' : '❌ 未开通发布权限'}
            </p>
            <p className="text-[11px] opacity-90">
                {user.hasRoi || user.isVip ? '✅ 已开通ROI工具箱' : '❌ 未开通ROI工具箱'}
            </p>
        </div>
      </div>
      
      <div className="px-3 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between py-3 px-4 ${item.bg} rounded-lg mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border ${item.border} active:scale-[0.98] transition-transform`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[22px] leading-none drop-shadow-sm">{item.emoji}</span>
              <span className="font-bold text-[#333] text-[16px]">{item.name}</span>
            </div>
            <span className="text-[#a0a0a0] text-[16px] font-light">→</span>
          </button>
        ))}

        {user.phone === "admin" && (
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center justify-between py-3 px-4 bg-[#f0f0f0] rounded-lg mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#e0e0e0] active:scale-[0.98] transition-transform`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[22px] leading-none drop-shadow-sm">🛡️</span>
              <span className="font-bold text-[#333] text-[16px]">后台管理</span>
            </div>
            <span className="text-[#a0a0a0] text-[16px] font-light">→</span>
          </button>
        )}
        
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#f55959] text-white rounded-lg shadow-[0_4px_12px_rgba(245,89,89,0.3)] mt-4 font-bold text-[16px] border border-[#f24e4e] active:scale-[0.98] transition-transform">
          <span className="text-[18px] opacity-90">📒</span>
          <span className="tracking-widest">退出登录</span>
        </button>
      </div>
    </div>
  );
}

