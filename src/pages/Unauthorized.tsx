import React from "react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">
      <div className="bg-gradient-to-br from-[#6a82fb] to-[#9565c6] rounded-b-[40px] pt-20 pb-16 px-6 flex flex-col items-center shadow-lg relative overflow-hidden transition-all duration-500">
        {/* Avatar Circle */}
        <div className="w-[100px] h-[100px] bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
          <div className="w-[80px] h-[80px] bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white/40">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-[26px] font-bold text-white mb-2">未登录</h1>
        <p className="text-[14px] text-white/90 mb-8 max-w-[240px] mx-auto text-center leading-relaxed">
          登录后查看个人信息、管理转让和求购
        </p>
        
        <button 
          onClick={() => navigate('/login')}
          className="bg-white text-[#7d7cf2] px-14 py-4 rounded-full font-bold text-[16px] shadow-xl active:scale-95 transition-transform"
        >
          立即登录 / 注册
        </button>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center px-10 text-center text-gray-300 opacity-20 pointer-events-none">
        <div className="w-16 h-16 border-4 border-current rounded-2xl mb-4 border-dashed"></div>
        <p className="text-sm font-medium tracking-widest">PRIVATE SPACE</p>
      </div>
    </div>
  );
}
