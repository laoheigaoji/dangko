import { useState, useEffect } from "react";
import { ChevronLeft, User as UserIcon, MessageCircle, Phone, Mail, Save, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [nickName, setNickName] = useState("");
  const [wx, setWx] = useState("");
  const [qq, setQq] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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
    setNickName(data.phone); // Or a separate nickname if added
    setWx(data.wx || "");
    setQq(data.qq || "");
    setPhone(data.phone || "");
    setEmail(data.email || "");
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, wx, qq, phone })
      });
      if (res.ok) {
        alert("保存成功");
        navigate("/profile");
      }
    } catch (e) {
      console.error(e);
      alert("保存失败");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">
      <div className="bg-gradient-to-r from-[#5978f5] to-[#8b55b7] px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center relative z-10">
          <button onClick={() => navigate(-1)} className="mr-2"><ChevronLeft size={24} /></button>
          <h1 className="font-bold text-[18px]">编辑资料</h1>
        </div>
      </div>

      <div className="px-3 mt-3">
        <div className="bg-white p-4 rounded-[12px] shadow-[0_2px_8px_rgba(89,120,245,0.06)] border border-[#eef0f5]">
          
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-[14px] text-[#333] mb-1.5 font-bold">
              <UserIcon size={16} className="text-[#4b3552] fill-[#4b3552]" /> 账号 (手机号)
            </div>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full border border-[#eef0f5] rounded-lg py-2.5 px-4 text-[14px] text-[#999] font-medium outline-none bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-[14px] text-[#333] mb-1.5 font-bold">
              <MessageCircle size={16} className="text-[#a8a8aa]" /> 微信号
            </div>
            <input
              type="text"
              value={wx}
              onChange={e => setWx(e.target.value)}
              className="w-full border border-[#eef0f5] rounded-lg py-2.5 px-4 text-[14px] text-[#333] font-medium outline-none focus:border-[#5978f5] shadow-sm"
              placeholder="请输入微信号"
            />
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-[14px] text-[#333] mb-1.5 font-bold">
              <div className="w-[16px] h-[16px] rounded-full border-[1.5px] border-[#a074c4] flex items-center justify-center">
                <div className="w-1 h-1 bg-[#a074c4] rounded-full"></div>
              </div> 
              QQ号
            </div>
            <input
              type="text"
              value={qq}
              onChange={e => setQq(e.target.value)}
              placeholder="请输入QQ号"
              className="w-full border border-[#eef0f5] rounded-lg py-2.5 px-4 text-[14px] text-[#333] font-medium outline-none focus:border-[#5978f5] shadow-sm placeholder:text-[#ccc]"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[14px] text-[#333] mb-1.5 font-bold">
              <Mail size={16} className="text-[#5983be] fill-[#dbe9fa]" /> 邮箱地址
            </div>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              className="w-full border border-[#eef0f5] rounded-lg py-2.5 px-4 text-[14px] text-[#333] font-medium outline-none focus:border-[#5978f5] shadow-sm"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#6b85ef] to-[#865bc1] text-white rounded-[10px] py-3 flex items-center justify-center gap-2 font-bold text-[15px] shadow-[0_4px_12px_rgba(107,133,239,0.3)] active:scale-[0.98] transition-transform"
          >
            <span className="text-[18px]">💾</span> 保存修改
          </button>
        </div>

        <div className="bg-[#f0f7fe] p-4 rounded-[12px] border border-[#ddebfa] mt-4 flex items-start gap-2">
          <Lightbulb size={20} className="text-[#f5c342] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#333] text-[14px] mb-1">温馨提示：</div>
            <div className="text-[12px] text-[#666] leading-relaxed">
              填写联系方式后，其他用户才能联系到你进行交易。建议至少填写一种联系方式。<br/><br/>
              填写邮箱后，可接收订阅档口的新信息邮件通知。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
