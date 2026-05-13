import { ChevronLeft, Trash2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProfileBuy() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    fetch(`/api/users/${user.phone}/buy`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/buy/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter(item => item._id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {
      alert("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#70c946] rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-16">
      <div className="bg-gradient-to-r from-[#70c946] to-[#4caf50] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">我的求购</h1>
        </div>
      </div>

      <div className="px-3 mt-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 px-4">
            <div className="text-[60px] mb-4 drop-shadow-md">🛒</div>
            <div className="text-[18px] font-bold text-[#555] mb-2">暂无求购信息</div>
            <div className="text-[14px] text-[#999] mb-8">快去发布第一条求购信息吧！</div>
            
            <button 
              onClick={() => navigate('/profile/publish-buy')}
              className="bg-gradient-to-r from-[#70c946] to-[#4caf50] text-white px-8 py-2.5 rounded-full font-medium shadow-[0_4px_12px_rgba(112,201,70,0.3)] active:scale-[0.98] transition-transform"
            >
              + 发布求购
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1 mb-2">
              <span className="text-[13px] text-gray-500">共 {items.length} 条记录</span>
              <button 
                onClick={() => navigate('/profile/publish-buy')}
                className="text-[13px] text-[#70c946] font-medium"
              >
                + 继续发布
              </button>
            </div>
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white p-4 relative overflow-hidden group">
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] rounded-bl-xl font-bold uppercase ${
                  item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                  item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                }`}>
                  {item.status === 'approved' ? '已发布' : item.status === 'pending' ? '审核中' : '已拒绝'}
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-[16px] text-gray-800 mb-0.5">{item.shopName}</h3>
                    <div className="flex items-center text-[12px] text-gray-400">
                      <Clock size={12} className="mr-1" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeleteId(item._id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">求购金额</p>
                  <p className="text-[18px] font-bold text-[#70c946]">¥{item.requestAmount}</p>
                </div>

                {item.remark && (
                  <div className="text-[13px] text-gray-600 mb-2 line-clamp-2">
                    <span className="text-gray-400">备注: </span>{item.remark}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除？</h3>
              <p className="text-sm text-gray-500">删除后将无法恢复，确定要移除这条求购信息吗？</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 text-sm font-medium text-gray-400 active:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 text-sm font-bold text-red-500 border-l border-gray-100 active:bg-red-50 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
