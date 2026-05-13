import React, { useState, useEffect, useRef } from "react";
import { CalendarDays, Share2, Star, Edit3, ArrowUpRight, Search, RefreshCw } from "lucide-react";
import { IBuyItem } from "../models/BuyItem";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Buy() {
  const [items, setItems] = useState<IBuyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [showPublishWarning, setShowPublishWarning] = useState(false);
  
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);

  const fetchData = async (keyword = "") => {
    try {
      const url = keyword ? `/api/buy?search=${encodeURIComponent(keyword)}` : "/api/buy";
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch buy items", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPullProgress(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchData(searchTerm);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(searchTerm);
  };

  // Touch handlers for pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].pageY;
      const progress = Math.min((currentY - startY.current) / 100, 1);
      if (progress > 0) {
        setPullProgress(progress);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullProgress > 0.8) {
      onRefresh();
    } else {
      setPullProgress(0);
    }
    startY.current = 0;
  };

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate('/unauthorized');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.isVip) {
      setShowPublishWarning(true);
    } else {
      navigate('/profile/publish-buy');
    }
  };

  const formatDate = (dateString: Date) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  return (
    <div 
      className="pb-16 min-h-screen bg-[#f5f6f8]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull down indicator */}
      <div 
        className="overflow-hidden transition-all duration-200 flex justify-center items-center bg-gray-100"
        style={{ height: refreshing ? '50px' : `${pullProgress * 50}px` }}
      >
        <RefreshCw 
          size={20} 
          className={`text-[#70c946] ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${pullProgress * 360}deg)` }}
        />
        <span className="ml-2 text-xs text-gray-500 font-medium">
          {refreshing ? "刷新中..." : (pullProgress > 0.8 ? "释放刷新" : "下拉刷新")}
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#70c946] to-[#4caf50] px-4 pt-8 pb-5 rounded-b-[30px] text-white flex justify-between items-end shadow-sm relative z-20">
        <h1 className="text-2xl font-bold tracking-wider">档口余额求购</h1>
        <p className="text-xs opacity-90 pb-1">发现优质求购信息</p>
      </div>
      
      <div className="sticky top-0 z-10 bg-[#f5f6f8] px-3 py-3 mt-2">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="relative flex gap-2"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索档口名称或备注..."
              className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl bg-white shadow-sm outline-none text-sm focus:border-[#70c946] transition-colors"
            />
          </div>
          <button 
            type="submit"
            className="bg-[#4caf50] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm text-sm active:scale-95 transition-transform"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="px-3 space-y-2 mt-2">
        {loading && items.length === 0 ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#70c946] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">正在搜索档口...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="text-gray-400">未找到相关求购信息</p>
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(""); fetchData(""); }}
                className="mt-4 text-[#70c946] text-sm font-medium"
              >
                重置搜索
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Link to={`/buy/${item._id}`} className="block bg-[#eafceb] p-3 rounded-lg border border-[#d2f0d4] shadow-[0_2px_8px_rgba(76,175,80,0.1)] active:bg-[#d9f5da]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[16px] text-gray-800 truncate pr-2 flex-1">档口: {item.shopName}</span>
                    <span className="text-[#ff3b30] font-bold text-[20px] shrink-0">¥{item.requestAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2 text-[13px] text-gray-600">
                    <span className="truncate">昵称: {item.userName}</span>
                    <div className="flex items-center gap-2 text-gray-400 shrink-0">
                      <ArrowUpRight size={13} className="text-[#b3afab]" />
                      <Star size={14} className="fill-current text-[#b3afab]" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-[#d2f0d4] border-dashed pt-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-[#84a9e6]" /> 
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#e27c6b]">
                      <Edit3 size={13} className="text-[#e27c6b]" />
                      <span className="truncate max-w-[120px] text-gray-500">{item.remark || "多少都收"}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      
      <button 
        onClick={handlePublishClick}
        className="fixed bottom-[80px] right-4 bg-[#70c946] text-white py-2 px-4 rounded-lg shadow-md font-bold text-sm">
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
              className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#70c946] to-[#4caf50] text-white font-bold text-[15px] shadow-[0_4px_12px_rgba(112,201,70,0.3)] active:scale-[0.98] transition-transform"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
