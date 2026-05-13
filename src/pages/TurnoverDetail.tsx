import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ITurnoverItem } from "../models/TurnoverItem";
import { ChevronLeft, Heart, Share2, User, CalendarDays, Eye, MessageCircle } from "lucide-react";

export default function TurnoverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ITurnoverItem | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      fetch(`/api/users/${parsedUser.id}`)
        .then(res => res.json())
        .then(userData => {
          if (userData.favorites?.includes(id)) {
            setIsFavorited(true);
          }
        });
    }

    fetch(`/api/turnover/${id}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!item) return <div className="text-center mt-20">加载中...</div>;

  const handleFavorite = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await fetch(`/api/users/${user.id}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id })
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[转让] ${item.shopName}`,
          text: `现价 ¥${item.transferPrice}, 详情请见新塘档口平台`,
          url: window.location.href,
        });
      } catch (e) {
        console.error("Error sharing", e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("链接已复制到剪贴板");
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
    <div className="pb-20 min-h-screen bg-[#f5f6f8] font-sans">
      <div className="bg-gradient-to-r from-[#44a0fe] to-[#60b6fe] px-3 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="flex items-center mb-4 relative z-10">
          <Link to="/" className="mr-2"><ChevronLeft size={24} /></Link>
          <h1 className="flex-1 font-bold text-[18px]">转让详情</h1>
        </div>
        <div className="text-[12px] opacity-90 relative z-10 px-1">
          用户{item.userName}的新塘档口余额互转平台信息
        </div>
      </div>
      
      <div className="px-3 mt-3">
        <div className="bg-[#f0f7fe] p-4 rounded-[12px] shadow-[0_2px_8px_rgba(75,140,217,0.06)] border border-[#e2effa]">
          <div className="font-bold text-[16px] mb-3 text-[#333]">档口: {item.shopName}</div>
          
          <div className="bg-white p-3 rounded-[12px] flex justify-between items-center mb-3 border-l-[4px] border-[#44a0fe] shadow-sm">
            <div>
              <div className="text-[#999] text-[12px] mb-1">原价</div>
              <div className="text-[18px] font-medium text-[#c0c4cc]">¥{item.originalPrice}</div>
            </div>
            <div className="text-center">
              <div className="text-[#999] text-[12px] mb-1">现价</div>
              <div className="text-[#ff3b30] font-bold text-[28px]">¥{item.transferPrice}</div>
            </div>
            <div className="bg-[#faffeb] border border-[#d4e4b5] text-[#7eb338] font-bold px-3 py-1.5 rounded-[8px] flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-[18px] leading-tight">{((item.transferPrice / item.originalPrice) * 10).toFixed(1)}</span>
              <span className="text-[12px] leading-tight font-normal">折</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[12px] text-[#999] pt-2 border-t border-dashed border-[#d0e4f5]">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#82aee6]"/> {formatDate(item.createdAt)}
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><Eye size={14} className="text-[#8c5b43]"/> {item.views || 0}</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className="text-[#f56c6c] fill-current"/> 0</span>
            </div>
          </div>
        </div>

        <div className="bg-[#f0f7fe] p-4 rounded-[12px] shadow-[0_2px_8px_rgba(75,140,217,0.06)] border border-[#e2effa] mt-3">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[#333] mb-3">
            <User size={16} className="text-[#4b8cd9]"/> 发布者信息
          </div>
          <div className="text-[14px] mb-3 text-[#333] font-bold">昵称: {item.userName}</div>
          
          <div className="border-t border-dashed border-[#d0e4f5] my-3" />
          
          {item.wx && (
            <div className="flex justify-between items-center text-[13px] mb-3 text-[#999]">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#ccc]"/> 微信
              </div>
              <span className="font-bold text-[#333]">{item.wx}</span>
            </div>
          )}
          
          {item.qq && (
            <div className="flex justify-between items-center text-[13px] mb-2 text-[#999]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ccc] flex items-center justify-center text-white text-[10px]">
                  <span className="text-transparent" style={{textShadow: "0 0 0 white"}}>企</span>
                </div> QQ
              </div>
              <span className="font-bold text-[#333]">{item.qq}</span>
            </div>
          )}
          
          {item.phone && (
            <div className="flex justify-between items-center text-[13px] mb-2 text-[#999]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ccc] flex items-center justify-center text-white text-[10px]">P</div> 电话
              </div>
              <span className="font-bold text-[#333]">{item.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleFavorite}
            className={`flex-1 rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-[14px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.02)] border ${isFavorited ? 'bg-[#ff3b30] text-white border-[#ff3b30]' : 'bg-white text-[#666] border-[#e0e0e0]'}`}
          >
            <span className="text-[16px]">{isFavorited ? '★' : '☆'}</span> {isFavorited ? '已收藏' : '收藏'}
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 bg-white border border-[#e0e0e0] rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#666] shadow-[0_2px_8_rgba(0,0,0,0.02)]"
          >
            <Share2 size={16} className="text-[#666]" /> 分享给好友
          </button>
        </div>
        
        <div className="text-center text-[#ccc] text-[11px] mt-4">
          点击联系方式可查看，电话可直接拨打
        </div>
      </div>
    </div>
  );
}
