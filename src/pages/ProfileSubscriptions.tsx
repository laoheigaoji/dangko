import { useState, useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileSubscriptions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [shopName, setShopName] = useState("");
  const [subTurnover, setSubTurnover] = useState(true);
  const [subBuy, setSubBuy] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return navigate("/login");
    const parsedUser = JSON.parse(u);
    fetchUser(parsedUser.id);
  }, []);

  const fetchUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    setUser(data);
  };

  const handleAddSubscription = async () => {
    if (!shopName.trim()) return alert("请输入档口名称");
    try {
      const res = await fetch(`/api/users/${user._id}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, turnover: subTurnover, buy: subBuy })
      });
      if (res.ok) {
        setShopName("");
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSubscription = async (name: string) => {
    try {
      const res = await fetch(`/api/users/${user._id}/subscriptions/${name}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">
      <div className="bg-gradient-to-r from-[#5978f5] to-[#8b55b7] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10 mb-2">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">订阅档口</h1>
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="bg-white p-4 rounded-[12px] shadow-[0_2px_8px_rgba(89,120,245,0.06)] border border-[#eef0f5] mb-4">
          <div className="font-bold text-[#333] text-[15px] mb-2 flex items-center gap-1.5">
            <span className="text-[16px]">🏪</span> 档口名称<span className="text-[#f55959]">*</span>
          </div>
          
          <input
            type="text"
            placeholder="输入要订阅的档口名称"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border border-[#eef0f5] rounded-lg py-2.5 px-4 text-[14px] text-[#333] font-medium outline-none focus:border-[#5978f5] shadow-sm mb-3 placeholder:text-[#ccc]"
          />
          
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={subTurnover} 
                onChange={e => setSubTurnover(e.target.checked)}
                className="hidden"
              />
              <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center ${subTurnover ? 'bg-[#44a0fe]' : 'bg-gray-200'}`}>
                {subTurnover && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[14px] font-bold text-[#333]">订阅转让</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={subBuy} 
                onChange={e => setSubBuy(e.target.checked)}
                className="hidden"
              />
              <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center ${subBuy ? 'bg-[#64c33a]' : 'bg-gray-200'}`}>
                {subBuy && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[14px] font-bold text-[#333]">订阅求购</span>
            </label>
          </div>
          
          <button 
            onClick={handleAddSubscription}
            className="w-full bg-gradient-to-r from-[#6b85ef] to-[#865bc1] text-white py-3 rounded-[10px] font-bold text-[15px] shadow-[0_4px_12px_rgba(107,133,239,0.3)] flex justify-center items-center gap-1 active:scale-[0.98] transition-transform"
          >
            <span className="text-[#a0b0f7] opacity-80">+</span> 添加订阅
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {user?.subscriptions && user.subscriptions.length > 0 ? (
            user.subscriptions.map((s: any) => (
              <div key={s.shopName} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border border-gray-100">
                <div>
                  <div className="font-bold text-gray-800">{s.shopName}</div>
                  <div className="text-xs text-gray-400 mt-1 flex gap-2">
                    {s.turnover && <span className="bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">转让</span>}
                    {s.buy && <span className="bg-green-50 text-green-500 px-1.5 py-0.5 rounded">求购</span>}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteSubscription(s.shopName)}
                  className="p-1.5 text-red-400 hover:text-red-500 bg-red-50 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-[50px] mb-4 drop-shadow-md">🔔</div>
              <div className="text-[16px] font-bold text-[#666] mb-2">暂无订阅的档口</div>
              <div className="text-[13px] text-[#999]">订阅档口后，该档口有新信息时将通过邮件通知您</div>
            </div>
          )}
        </div>

        <div className="bg-[#f0efff] p-4 rounded-[12px] border border-[#dcd9fa] flex items-start gap-2 shadow-[0_2px_8px_rgba(89,120,245,0.03)]">
          <span className="text-[#f5c342] mt-0.5 text-[16px]">💡</span>
          <div>
            <div className="font-bold text-[#333] text-[14px] mb-1.5">温馨提示：</div>
            <div className="text-[12px] text-[#666] leading-[1.8]">
              • 订阅档口后，该档口有新的转让或求购信息时，系统将发送邮件通知<br/>
              • 请确保在「修改资料」中填写了正确的邮箱地址<br/>
              • 可分别选择订阅转让信息或求购信息
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
