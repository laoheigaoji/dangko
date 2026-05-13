import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PublishTurnover() {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ id: 1, shopName: "", transferAmount: "", transferPrice: "", remark: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => setItems([...items, { id: Date.now(), shopName: "", transferAmount: "", transferPrice: "", remark: "" }]);
  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("请先登录");
      navigate("/login");
      return;
    }

    const userInfo = JSON.parse(userStr);
    
    // Validate
    for (const item of items) {
      if (!item.shopName.trim() || !item.transferAmount || !item.transferPrice) {
        alert("请填写完整的转让信息（档口名称、金额、价格）");
        return;
      }
      if (Number(item.transferPrice) > Number(item.transferAmount)) {
        alert(`档口 ${item.shopName} 的转让价格不能大于转让金额`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Fetch full user profile to get contact info
      const userRes = await fetch(`/api/users/${userInfo.id}`);
      const userProfile = await userRes.json();

      const promises = items.map(item => 
        fetch("/api/turnover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopName: item.shopName,
            originalPrice: Number(item.transferAmount),
            transferPrice: Number(item.transferPrice),
            description: item.remark,
            userName: userProfile.phone || "匿名用户",
            phone: userProfile.phone,
            wx: userProfile.wx,
            qq: userProfile.qq
          })
        })
      );

      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);

      if (allOk) {
        alert("发布成功！");
        navigate("/");
      } else {
        alert("部分信息发布失败，请重试");
      }
    } catch (e) {
      console.error(e);
      alert("网络连接失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">
      <div className="bg-gradient-to-r from-[#44a0fe] to-[#60b6fe] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="flex items-center relative z-10 mb-2">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">发布转让</h1>
        </div>
        <div className="text-[13px] opacity-90 relative z-10 px-1">
          批量发布转让信息，一次可发布多条
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="bg-white p-3 rounded-[12px] shadow-[0_2px_8px_rgba(75,140,217,0.06)] border border-[#eef0f5] mb-3">
          <div className="flex items-center text-[15px] text-[#333] mb-3 font-bold">
            <span className="mr-1.5 text-[16px]">📋</span> 转让信息列表 
            <span className="text-[#a0a0a0] font-normal text-[13px] ml-2">共 {items.length} 条</span>
          </div>
          
          {items.map((item, index) => (
            <div key={item.id} className="bg-white border border-[#eff1f4] rounded-[10px] p-3 mb-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#4b8cd9] font-bold text-[14px]">#{index + 1}</span>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="text-[#e26463] text-[12px] border border-[#fbdbd9] px-2.5 py-1 rounded-[6px] flex items-center gap-1 bg-[#fff6f6]"
                >
                  <span className="text-[10px]">✕</span> 移除
                </button>
              </div>
              <input 
                type="text" 
                placeholder="档口名称 (如: A档口)" 
                value={item.shopName}
                onChange={(e) => updateItem(item.id, "shopName", e.target.value)}
                className="w-full text-[14px] py-2 px-3 border border-[#eef0f5] rounded-lg mb-2 outline-none focus:border-[#44a0fe] placeholder:text-[#ccc] text-[#333]" 
              />
              <div className="flex gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="¥ 转让金额" 
                  value={item.transferAmount}
                  onChange={(e) => updateItem(item.id, "transferAmount", e.target.value)}
                  className="flex-1 text-[14px] w-0 py-2 px-3 border border-[#eef0f5] rounded-lg outline-none focus:border-[#44a0fe] placeholder:text-[#ccc] text-[#333]" 
                />
                <input 
                  type="number" 
                  placeholder="¥ 转让价格" 
                  value={item.transferPrice}
                  onChange={(e) => updateItem(item.id, "transferPrice", e.target.value)}
                  className="flex-1 text-[14px] w-0 py-2 px-3 border border-[#eef0f5] rounded-lg outline-none focus:border-[#44a0fe] placeholder:text-[#ccc] text-[#333]" 
                />
              </div>
              
              {item.transferAmount && item.transferPrice && (
                <div className="text-[12px] mb-2 text-[#44a0fe] font-medium bg-[#f0f7fe] py-1 px-2 rounded-md inline-block">
                  预算折扣: { (Number(item.transferPrice) / Number(item.transferAmount) * 10).toFixed(1) } 折
                </div>
              )}
              <textarea 
                placeholder="备注说明 (选填)" 
                value={item.remark}
                onChange={(e) => updateItem(item.id, "remark", e.target.value)}
                className="w-full text-[14px] py-2 px-3 border border-[#eef0f5] rounded-lg outline-none hover:border-[#44a0fe] focus:border-[#44a0fe] placeholder:text-[#ccc] text-[#333] resize-none" 
                rows={2}
              />
            </div>
          ))}
          
          <button 
            onClick={addItem} 
            className="w-full border border-dashed border-[#a1c4eb] bg-[#f5f9fe] text-[#4b8cd9] py-2.5 rounded-lg mb-3 font-medium text-[14px] flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
          >
            + 添加一条
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#4da8ff] text-white rounded-[10px] py-3 font-bold text-[15px] flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(77,168,255,0.3)] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="text-[18px]">🚀</span> {isSubmitting ? "发布中..." : `批量发布 ${items.length} 条转让信息`}
          </button>
        </div>

        <div className="bg-[#f0f7fe] p-4 rounded-[12px] border border-[#ddebfa] flex items-start gap-2">
          <span className="text-[#f5c342] mt-0.5 text-[16px]">💡</span>
          <div>
            <div className="font-bold text-[#333] text-[14px] mb-1.5">温馨提示：</div>
            <div className="text-[12px] text-[#666] leading-[1.8]">
              • 转让价格应小于或等于转让金额<br/>
              • 折扣率会自动计算并显示<br/>
              • 发布后需要管理员审核才能显示在列表中
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
