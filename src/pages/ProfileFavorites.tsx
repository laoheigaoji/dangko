import { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Star, Heart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function ProfileFavorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return navigate("/login");
    const parsedUser = JSON.parse(u);
    fetchFavorites(parsedUser.id);
  }, []);

  const fetchFavorites = async (id: string) => {
    try {
      const uRes = await fetch(`/api/users/${id}`);
      const user = await uRes.json();
      
      const [tRes, bRes] = await Promise.all([
        fetch('/api/turnover'),
        fetch('/api/buy')
      ]);
      const turnovers = await tRes.json();
      const buys = await bRes.json();
      
      const favItems = [...turnovers, ...buys]
        .filter(item => user.favorites.includes(item._id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFavorites(favItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">
      <div className="bg-gradient-to-r from-[#ed6969] to-[#f45151] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">我的收藏</h1>
        </div>
      </div>

      <div className="px-3 mt-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : favorites.length > 0 ? (
          favorites.map(item => (
            <Link 
              key={item._id} 
              to={item.transferPrice ? `/turnover/${item._id}` : `/buy/${item._id}`}
              className="block bg-white p-4 rounded-[12px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[16px] text-[#333]">档口: {item.shopName}</span>
                <span className={`${item.transferPrice ? 'text-[#ff3b30]' : 'text-[#64c33a]'} font-bold text-[18px]`}>
                  ¥{item.transferPrice || item.requestAmount}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[12px] text-[#999] pt-2 border-t border-dashed border-gray-100">
                <span className="flex items-center gap-1.5">
                  {item.transferPrice ? (
                    <><span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">转</span> 转让信息</>
                  ) : (
                    <><ShoppingCart size={14} className="text-green-500" /> 求购信息</>
                  )}
                </span>
                <Heart size={16} className="text-red-500 fill-current" />
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-[60px] mb-4 opacity-20">❤️</div>
            <div className="text-gray-400">暂无收藏</div>
          </div>
        )}
      </div>
    </div>
  );
}
