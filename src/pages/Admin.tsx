import { useState, useEffect } from "react";
import { Trash2, Shield, User as UserIcon, LogOut, Info, Check, X } from "lucide-react";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [turnoverItems, setTurnoverItems] = useState<any[]>([]);
  const [buyItems, setBuyItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'turnover' | 'buy' | null>(null);
  const [pendingTurnover, setPendingTurnover] = useState<any[]>([]);
  const [pendingBuy, setPendingBuy] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [smtp, setSmtp] = useState({ host: '', port: '', user: '', pass: '', from: '' });

  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState("");

  const fetchSmtp = async () => {
    const res = await fetch('/api/settings/smtp');
    const data = await res.json();
    if (data) setSmtp(data);
  };

  const saveSmtp = async () => {
    try {
      await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtp)
      });
      alert('SMTP settings saved');
    } catch (e) {
      alert('Failed to save SMTP settings');
    }
  };

  const changeAdminPasswordGlobal = async () => {
    const adminUserStr = localStorage.getItem("adminUser");
    if (!adminUserStr || !adminNewPassword.trim()) return;
    const adminUser = JSON.parse(adminUserStr);
    try {
      await fetch(`/api/users/${adminUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminNewPassword })
      });
      alert("管理员密码修改成功! 请重新登录");
      setShowAdminPasswordModal(false);
      setAdminNewPassword("");
      handleLogout();
    } catch (e) {
      console.error(e);
      alert("修改失败");
    }
  };

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (!adminUser) {
      window.location.href = '/admin/login';
      return;
    }
    fetchData();
    fetchSmtp();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, tRes, bRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/admin/turnover'),
        fetch('/api/admin/buy')
      ]);
      setUsers(await uRes.json());
      setTurnoverItems(await tRes.json());
      setBuyItems(await bRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVip = async (id: string, currentVip: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/vip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip: !currentVip })
      });
      const updatedUser = await res.json();
      
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id === id) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, isVip: updatedUser.isVip }));
        }
      }
      
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const changePassword = async (id: string) => {
    if (!newPassword.trim()) return;
    try {
      await fetch(`/api/users/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      setEditingPasswordId(null);
      setNewPassword("");
      alert("密码修改成功!");
    } catch (e) {
      console.error(e);
      alert("修改失败");
    }
  };

  const deleteTurnover = async (id: string) => {
    if (!confirm('sure?')) return;
    try {
      await fetch(`/api/turnover/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBuy = async (id: string) => {
    if (!confirm('sure?')) return;
    try {
      await fetch(`/api/buy/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleModeration = async (type: 'turnover' | 'buy', id: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/admin/approve/${type}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-20">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 pt-8 pb-4 rounded-b-[20px] text-white shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold">后台管理</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowAdminPasswordModal(true)} 
            className="text-sm font-medium text-blue-300 hover:text-white flex items-center gap-1"
          >
            修改管理密码
          </button>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1">
            <LogOut size={16} /> 退出
          </button>
        </div>
      </div>

      {showAdminPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">修改管理员密码</h2>
            <input
              type="text"
              placeholder="新密码"
              value={adminNewPassword}
              onChange={(e) => setAdminNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAdminPasswordModal(false)}
                className="px-4 py-2 text-gray-600 font-medium bg-gray-100 rounded hover:bg-gray-200"
              >
                取消
              </button>
              <button 
                onClick={changeAdminPasswordGlobal}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-4">
        <div className="flex gap-2 mb-4 bg-white p-1 rounded-lg shadow-sm overflow-x-auto">
          {['users', 'turnover', 'buy', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); setStatusFilter('all'); }}
              className={`flex-1 min-w-[80px] py-2 text-xs font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-gray-800 text-white' : 'text-gray-600'}`}
            >
              {tab === 'users' ? '用户管理' : tab === 'turnover' ? '转让订单' : tab === 'buy' ? '求购订单' : '系统配置'}
            </button>
          ))}
        </div>

        {(activeTab === 'turnover' || activeTab === 'buy') && (
          <div className="flex gap-2 mb-4">
            {['all', 'pending', 'approved', 'rejected'].map((status: any) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  statusFilter === status 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {status === 'all' ? '全部' : status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}
              </button>
            ))}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder={activeTab === 'users' ? "搜索手机号..." : "搜索档口名称..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-800 transition-colors"
          />
        </div>

        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.filter(u => u.phone.includes(searchQuery)).map(user => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <UserIcon size={20} className="text-gray-600"/>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{user.phone}</div>
                      <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end mt-2 md:mt-0">
                    <button
                      onClick={() => setEditingPasswordId(editingPasswordId === user._id ? null : user._id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-500 border border-blue-200"
                    >
                      修改密码
                    </button>
                    <button
                      onClick={() => toggleVip(user._id, user.isVip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${user.isVip ? 'bg-[#ffeedb] text-[#f59e0b]' : 'bg-gray-100 text-gray-500'}`}
                    >
                      <Shield size={14} /> {user.isVip ? '已开通VIP' : '开通VIP'}
                    </button>
                  </div>
                </div>
                {editingPasswordId === user._id && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <input
                      type="text"
                      placeholder="新密码"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => changePassword(user._id)}
                      className="px-4 py-1 bg-blue-500 text-white rounded text-sm font-medium"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'turnover' && (
          <div className="space-y-3">
            {turnoverItems
              .filter(t => t.shopName.includes(searchQuery))
              .filter(t => statusFilter === 'all' || t.status === statusFilter)
              .map(item => (
                <div 
                  key={item._id} 
                  onClick={() => { setSelectedItem(item); setItemType('turnover'); }}
                  className="bg-white p-4 rounded-lg shadow-sm flex items-start justify-between cursor-pointer border hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">档口: {item.shopName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        item.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">发布者: {item.userName}</div>
                    <div className="text-sm text-gray-500 mt-1">原价 ¥{item.originalPrice} -&gt; ¥{item.transferPrice}</div>
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteTurnover(item._id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'buy' && (
          <div className="space-y-3">
            {buyItems
              .filter(b => b.shopName.includes(searchQuery))
              .filter(b => statusFilter === 'all' || b.status === statusFilter)
              .map(item => (
                <div 
                  key={item._id} 
                  onClick={() => { setSelectedItem(item); setItemType('buy'); }}
                  className="bg-white p-4 rounded-lg shadow-sm flex items-start justify-between cursor-pointer border hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">档口: {item.shopName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        item.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '待审核'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">发布者: {item.userName}</div>
                    <div className="text-sm text-gray-500 mt-1">求购金额 ¥{item.requestAmount}</div>
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteBuy(item._id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">详情预览</h2>
                    <p className="text-xs text-gray-500 mt-1">发布时间: {new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedItem(null); setItemType(null); }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">基础信息</div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-500">档口名称</div>
                        <div className="text-sm font-bold text-gray-800">{selectedItem.shopName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">类型</div>
                        <div className="text-sm font-bold text-blue-600">{itemType === 'turnover' ? '转让' : '求购'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">状态</div>
                        <div className={`text-sm font-bold ${
                          selectedItem.status === 'approved' ? 'text-green-600' : 
                          selectedItem.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {selectedItem.status === 'approved' ? '已通过' : selectedItem.status === 'rejected' ? '已拒绝' : '审核中'}
                        </div>
                      </div>
                      {itemType === 'turnover' ? (
                        <>
                          <div>
                            <div className="text-xs text-gray-500">转让价格</div>
                            <div className="text-sm font-bold text-red-500">¥{selectedItem.transferPrice}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">原金额</div>
                            <div className="text-sm font-bold text-gray-700">¥{selectedItem.originalPrice}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">折扣</div>
                            <div className="text-sm font-bold text-blue-500">{(selectedItem.transferPrice/selectedItem.originalPrice*10).toFixed(1)}折</div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className="text-xs text-gray-500">求购金额</div>
                          <div className="text-sm font-bold text-green-600">¥{selectedItem.requestAmount}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-xs text-blue-400 mb-1 uppercase font-bold tracking-wider">发布人信息</div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">用户名/手机号</span>
                        <span className="text-sm font-bold text-blue-900">{selectedItem.userName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">联系手机</span>
                        <span className="text-sm font-bold text-blue-900">{selectedItem.phone || '未填写'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">微信号</span>
                        <span className="text-sm font-bold text-blue-900">{selectedItem.wx || '未填写'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">QQ号</span>
                        <span className="text-sm font-bold text-blue-900">{selectedItem.qq || '未填写'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">说明/备注</div>
                    <div className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.description || selectedItem.remark || '无备注信息'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex gap-3">
                {selectedItem.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => { handleModeration(itemType!, selectedItem._id, 'approve'); setSelectedItem(null); }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-green-100"
                    >
                      <Check size={18} /> 通过审核
                    </button>
                    <button 
                      onClick={() => { handleModeration(itemType!, selectedItem._id, 'reject'); setSelectedItem(null); }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-100"
                    >
                      <X size={18} /> 拒绝发布
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setSelectedItem(null); setItemType(null); }}
                    className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl text-center"
                  >
                    关闭详情
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">SMTP 邮件配置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP Host</label>
                <input 
                  type="text" 
                  value={smtp.host} 
                  onChange={e => setSmtp({...smtp, host: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-gray-800"
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP Port</label>
                <input 
                  type="text" 
                  value={smtp.port} 
                  onChange={e => setSmtp({...smtp, port: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-gray-800"
                  placeholder="465"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP User</label>
                <input 
                  type="text" 
                  value={smtp.user} 
                  onChange={e => setSmtp({...smtp, user: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP Pass</label>
                <input 
                  type="password" 
                  value={smtp.pass} 
                  onChange={e => setSmtp({...smtp, pass: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-gray-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Sender Email (From)</label>
                <input 
                  type="text" 
                  value={smtp.from} 
                  onChange={e => setSmtp({...smtp, from: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-gray-800"
                  placeholder="platform@example.com"
                />
              </div>
            </div>
            <button 
              onClick={saveSmtp}
              className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
            >
              保存配置
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
