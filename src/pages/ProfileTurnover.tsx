import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ProfileTurnover() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-16">
      <div className="bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">我的转让</h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-32 px-4">
        <div className="text-[60px] mb-4 drop-shadow-md">📦</div>
        <div className="text-[18px] font-bold text-[#555] mb-2">暂无转让信息</div>
        <div className="text-[14px] text-[#999] mb-8">快去发布第一条转让信息吧！</div>
        
        <button 
          onClick={() => navigate('/profile/publish-turnover')}
          className="bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] text-white px-8 py-2.5 rounded-full font-medium shadow-[0_4px_12px_rgba(75,140,217,0.3)] active:scale-[0.98] transition-transform"
        >
          + 发布转让
        </button>
      </div>
    </div>
  );
}
