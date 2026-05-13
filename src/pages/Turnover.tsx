import { useState, useEffect } from "react";
import { Search, CalendarDays, Eye } from "lucide-react";
import { ITurnoverItem } from "../models/TurnoverItem";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Turnover() {
  const [items, setItems] = useState<ITurnoverItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPublishWarning, setShowPublishWarning] = useState(false);

  useEffect(() => {
    if (location.state?.showProfileReminder) {
      setShowPublishWarning(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetch("/api/turnover")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to fetch turnover items", err));
  }, []);

  const formatDate = (dateString: Date) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.isVip) {
      setShowPublishWarning(true);
    } else {
      navigate('/profile/publish-turnover');
    }
  };

  return (
    <div className="pb-16 min-h-screen bg-[#f5f6f8]">
      <div className="bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] px-4 pt-8 pb-4 rounded-b-[20px] text-white flex justify-between items-end shadow-sm">
        <h1 className="text-2xl font-bold tracking-wider">档口余额转让</h1>
        <p className="text-xs opacity-90 pb-1">发现优质转让信息</p>
      </div>
      
      <div className="sticky top-0 z-10 bg-[#f5f6f8] px-3 py-3 shadow-sm md:shadow-none">
        <div className="relative flex gap-2">
          <input
            type="text"
            placeholder="搜索档口名称..."
            className="flex-1 p-2.5 pl-4 border border-gray-200 rounded-lg bg-white shadow-sm outline-none text-sm"
          />
          <button className="bg-[#4d8fdb] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm text-sm">
            搜索
          </button>
        </div>
      </div>

      <div className="px-3 space-y-2">
        {items.map((item) => (
          <Link key={item._id} to={`/turnover/${item._id}`} className="block bg-[#f0f7fe] p-3 rounded-lg border border-[#e2effa] shadow-[0_2px_8px_rgba(75,140,217,0.1)]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[16px] text-gray-800">档口: {item.shopName}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-gray-400">原价 ¥{item.originalPrice}</span>
                <div className="flex items-baseline">
                  <span className="text-[#ff3b30] font-bold text-[20px]">¥{item.transferPrice}</span>
                  <span className="text-sm font-normal text-gray-500 ml-0.5">出</span>
                </div>
                <span className="text-[#4cd964] font-medium text-sm ml-1">
                  {((item.transferPrice / item.originalPrice) * 10).toFixed(1)}折
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-start mb-2 text-[13px] text-gray-600">
              <span className="whitespace-nowrap">用户: {item.userName}</span>
              {item.description && (
                <span className="text-right text-gray-500 truncate ml-4 flex-1">
                  {item.description}
                </span>
              )}
            </div>

            <div className="flex justify-between text-[11px] text-gray-400 border-t border-[#e2effa] border-dashed pt-2">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-[#82aee6]" /> 
                {formatDate(item.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={13} className="text-[#8c5b43]" /> 
                {item.views || 0}次浏览
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <button 
        onClick={handlePublishClick}
        className="fixed bottom-[80px] right-4 bg-[#4da8ff] text-white py-2 px-4 rounded-lg shadow-md font-bold text-sm">
        免费发布
      </button>

      {showPublishWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] pb-10 px-4">
          <div className="bg-white w-[300px] rounded-[24px] p-6 text-center flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
              <path d="M11.134 3.447c.4-.7 1.332-.7 1.732 0l8.28 14.34c.4.7-.098 1.583-.902 1.583H3.756c-.804 0-1.302-.883-.902-1.583l8.28-14.34z" fill="#fbbd23"/>
              <path d="M12 8v5" stroke="#333" strokeLinecap="round" strokeWidth="2.5"/>
              <circle cx="12" cy="16.5" r="1.5" fill="#333"/>
            </svg>
            <div className="text-[17px] font-bold text-[#333] mb-2 tracking-wide">无法发布</div>
            <div className="text-[14px] text-[#666] mb-6 leading-relaxed">
              您当前没有发布权限，<br/>
              请联系管理员<span className="text-[#4b8cd9] font-medium">开通会员权限</span>
            </div>
            <button 
              onClick={() => setShowPublishWarning(false)}
              className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] text-white font-bold text-[15px] shadow-[0_4px_12px_rgba(75,140,217,0.3)] active:scale-[0.98] transition-transform"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
