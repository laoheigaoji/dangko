import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IBuyItem } from "../models/BuyItem";
import { ChevronLeft, Share2, User, CalendarDays, Edit3, MessageCircle, Phone, Heart, Eye } from "lucide-react";

export default function BuyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<IBuyItem | null>(null);
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

    // Increment view
    fetch(`/api/buy/${id}/view`, { method: "PATCH" });

    fetch(`/api/buy/${id}`)
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
        // Refresh item data to get updated favoritesCount
        fetch(`/api/buy/${id}`)
          .then((res) => res.json())
          .then((data) => setItem(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[求购] ${item.shopName}`,
          text: `求购金额 ¥${item.requestAmount}, 详情请见新塘档口平台`,
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
      <div className="bg-gradient-to-r from-[#70c946] to-[#4caf50] px-3 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10">
          <Link to="/buy" className="mr-2"><ChevronLeft size={24} /></Link>
          <h1 className="font-bold text-[18px]">求购详情</h1>
        </div>
      </div>
      
      <div className="px-3 mt-3">
        <div className="bg-[#eafceb] p-4 rounded-[12px] shadow-[0_2px_8px_rgba(76,175,80,0.06)] border border-[#d2f0d4]">
          <div className="font-bold text-[16px] mb-3 text-[#333]">档口: {item.shopName}</div>
          
          <div className="flex items-baseline mb-4">
            <span className="text-[#999] text-[14px] mr-2">求购金额:</span>
            <span className="text-[#64c33a] font-bold text-[24px]">¥{item.requestAmount}</span>
          </div>
          
          <div className="flex justify-between items-center text-[12px] text-[#999] pt-2 border-t border-dashed border-[#d2f0d4] mb-2">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#84a9e6]"/> {formatDate(item.createdAt)}
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><Eye size={14} className="text-[#8c5b43]"/> {item.views || 0}</span>
              <span className="flex items-center gap-1.5"><Heart size={14} className={`size-[14px] ${isFavorited ? 'text-[#f56c6c] fill-current' : 'text-gray-300'}`}/> {item.favoritesCount || 0}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-[#d2f0d4] pt-2">
            <div className="flex items-center gap-1.5 text-[12px] text-[#999] mb-1.5">
              <Edit3 size={14} className="text-[#df7a6a]"/> 备注
            </div>
            <div className="text-[14px] text-[#666]">
              {item.remark || "多少都收"}
            </div>
          </div>
        </div>

        <div className="bg-[#f0f7fe] p-4 rounded-[12px] shadow-[0_2px_8px_rgba(75,140,217,0.06)] border border-[#e2effa] mt-3">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[#42312d] mb-3">
            <User size={16} className="text-[#412e2f]"/> 发布者信息
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
          
          {item.phone && (
            <div className="flex justify-between items-center text-[13px] text-[#999]">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#e26463]"/> 电话
              </div>
              <span className="font-bold text-[#44a0fe]">{item.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleFavorite}
            className={`flex-1 rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-[14px] font-medium shadow-sm ${isFavorited ? 'bg-[#ff3b30] text-white' : 'bg-[#6bc33c] text-white'}`}
          >
            <span className="text-[16px]">{isFavorited ? '★' : '☆'}</span> {isFavorited ? '已收藏' : '收藏'}
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 bg-white border border-[#e0e0e0] rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#666] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <Share2 size={16} className="text-[#666]" /> 分享
          </button>
        </div>
      </div>
    </div>
  );
}
