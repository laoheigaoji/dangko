import React, { useState, useEffect, useRef } from "react";
import { Search, CalendarDays, Eye, RefreshCw } from "lucide-react";
import { ITurnoverItem } from "../models/TurnoverItem";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Turnover() {
  const [items, setItems] = useState<ITurnoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [showPublishWarning, setShowPublishWarning] = useState(false);
  const [notice, setNotice] = useState<any>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [vipPlans, setVipPlans] = useState<any[]>([]);
  const [loadingPay, setLoadingPay] = useState(false);
  const [mockOrder, setMockOrder] = useState<any>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);

  const fetchData = async (keyword = "") => {
    try {
      const url = keyword ? `/api/turnover?search=${encodeURIComponent(keyword)}` : "/api/turnover";
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);

      // Fetch notice
      const nRes = await fetch("/api/settings/notice");
      const nData = await nRes.json();
      if (nData && nData.enabled) {
        setNotice(nData);
        // Check if seen
        const lastNotice = localStorage.getItem("lastNoticeTitle");
        if (lastNotice !== nData.title) {
          setShowNotice(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch turnover items", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPullProgress(0);
    }
  };

  useEffect(() => {
    if (location.state?.showProfileReminder) {
      setShowPublishWarning(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
    // Fetch VIP plans
    fetch('/api/settings/vip-plans')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setVipPlans(data);
        } else {
          setVipPlans([
            { id: 'month', name: '月度会员', price: '19.9', label: '尝鲜首选', popular: false },
            { id: 'quarter', name: '季度会员', price: '39.9', label: '超值推荐', popular: true },
            { id: 'year', name: '年度会员', price: '88', label: '长期经营', popular: false },
            { id: 'forever', name: '永久会员', price: '188', label: '终身买断', popular: false },
          ]);
        }
      });
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
      navigate('/unauthorized');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.hasPublish && !user.isVip) {
      setShowPublishWarning(true);
    } else {
      navigate('/profile/publish-turnover');
    }
  };

  const handlePay = async (plan: any) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    setLoadingPay(true);
    try {
      const res = await fetch('/api/payment/alipay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId: plan.id, type: 'publish' })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.mock) {
        setMockOrder({ ...data, plan });
      } else {
        alert(data.error || '支付发起失败');
      }
    } catch (e) {
      alert('网络错误');
    } finally {
      setLoadingPay(false);
    }
  };

  const confirmMockPay = async () => {
    if (!mockOrder) return;
    setLoadingPay(true);
    try {
      const res = await fetch('/api/payment/mock-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outTradeNo: mockOrder.outTradeNo })
      });
      const data = await res.json();
      if (data.success) {
        alert('购买成功！已为您开通发布权限');
        setShowPublishWarning(false);
        setMockOrder(null);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, hasPublish: true, isVip: true }));
        navigate('/profile/publish-turnover');
      }
    } catch (e) {
      alert('确认支付失败');
    } finally {
      setLoadingPay(false);
    }
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
          className={`text-[#4b8cd9] ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${pullProgress * 360}deg)` }}
        />
        <span className="ml-2 text-xs text-gray-500 font-medium">
          {refreshing ? "刷新中..." : (pullProgress > 0.8 ? "释放刷新" : "下拉刷新")}
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] px-4 pt-8 pb-5 rounded-b-[30px] text-white flex justify-between items-end shadow-sm relative z-20">
        <h1 className="text-2xl font-bold tracking-wider">档口余额转让</h1>
        <p className="text-xs opacity-90 pb-1">发现优质转让信息</p>
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
              placeholder="搜索档口名称或描述..."
              className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl bg-white shadow-sm outline-none text-sm focus:border-[#4b8cd9] transition-colors"
            />
          </div>
          <button 
            type="submit"
            className="bg-[#4d8fdb] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm text-sm active:scale-95 transition-transform"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="px-3 space-y-2 mt-2">
        {loading && items.length === 0 ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#4b8cd9] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">正在搜索档口...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="text-gray-400">未找到相关档口转让</p>
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(""); fetchData(""); }}
                className="mt-4 text-[#4b8cd9] text-sm font-medium"
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
                <Link to={`/turnover/${item._id}`} className="block bg-[#f0f7fe] p-3 rounded-lg border border-[#e2effa] shadow-[0_2px_8px_rgba(75,140,217,0.1)] active:bg-[#e8f1fb]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[16px] text-gray-800 truncate pr-2 flex-1">档口: {item.shopName}</span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
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
                    <span className="whitespace-nowrap shrink-0">用户: {item.userName}</span>
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
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      
      <button 
        onClick={handlePublishClick}
        className="fixed bottom-[80px] right-4 bg-[#4da8ff] text-white py-2 px-4 rounded-lg shadow-md font-bold text-sm">
        免费发布
      </button>

      {showPublishWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-[#4b8cd9] to-[#67c34b] p-6 text-white text-center">
              <h3 className="text-xl font-black">开通发布权限</h3>
              <p className="text-xs opacity-80 mt-1">解锁发布权限，快速转让/求购</p>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {vipPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => handlePay(plan)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-95 text-center relative ${plan.popular ? 'border-[#4b8cd9] bg-blue-50' : 'border-gray-100'}`}
                  >
                    {plan.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#4b8cd9] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">推荐</span>}
                    <div className="text-sm font-bold text-gray-800">{plan.name}</div>
                    <div className="text-lg font-black text-[#4b8cd9] mt-1">¥{plan.price}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{plan.label}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowPublishWarning(false)}
                className="w-full py-3 text-gray-400 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {mockOrder && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-[#4b8cd9] p-8 text-white text-center">
                    <h3 className="text-xl font-bold">支付确认</h3>
                    <p className="text-sm opacity-80 mt-1">请核对订单信息并完成支付</p>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">产品名称</span>
                            <span className="font-bold text-gray-800">发布权限-{mockOrder.plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">订单编号</span>
                            <span className="text-gray-600 font-mono text-xs">{mockOrder.outTradeNo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">支付金额</span>
                            <span className="text-2xl font-black text-[#4b8cd9]">¥{mockOrder.plan.price}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={confirmMockPay}
                            disabled={loadingPay}
                            className="w-full py-4 bg-[#4b8cd9] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loadingPay ? '处理中...' : '模拟支付宝支付'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Global Notice Modal */}
      {showNotice && notice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-[320px] rounded-[24px] overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-br from-[#6277f0] to-[#9853c4] p-6 text-center flex flex-col items-center relative">
              <div className="mb-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"/>
                  <path d="M19.07 4.93L12 12l7.07 7.07M4.93 4.93L12 12l-7.07 7.07" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2"/>
                  <rect x="7" y="8" width="10" height="8" rx="2" fill="white" fillOpacity="0.1"/>
                  <path d="M10 11.5L9 12l1 0.5M14 11.5L15 12l-1 0.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Megaphone icon */}
                  <path d="M16 8.5v7l-4-2H8v-3h4l4-2z" fill="#ff4d4d"/>
                  <path d="M16 10c1 0 1.5 1 1.5 2s-.5 2-1.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">{notice.title}</h2>
              <p className="text-white/70 text-[10px] font-mono tracking-widest uppercase">{notice.date}</p>
            </div>
            <div className="p-5">
              <div className="text-[#333] text-sm leading-relaxed text-center mb-4 px-1">
                {notice.content}
              </div>
              <button 
                onClick={() => {
                  setShowNotice(false);
                  localStorage.setItem("lastNoticeTitle", notice.title);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6277f0] to-[#9853c4] text-white font-bold text-[14px] shadow-[0_4px_15px_rgba(98,119,240,0.4)] active:scale-[0.98] transition-transform"
              >
                我知道了
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
