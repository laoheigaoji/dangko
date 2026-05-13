import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calculator } from "lucide-react";

type ROIResult = {
  breakEvenROI: string;
  profitRate: string;
  breakEvenBid: string;
};

type SKUItem = {
  id: number;
  price: string;
  cost: string;
  ratio: string; // Weight or estimated sales ratio
};

export default function ROI() {
  const [hasRoi, setHasRoi] = useState(false);
  const [vipPlans, setVipPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mockOrder, setMockOrder] = useState<any>(null);

  // Merchant Inputs
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [skuList, setSkuList] = useState<SKUItem[]>([
    { id: Date.now(), price: "", cost: "", ratio: "1" }
  ]);

  // Influencer Inputs
  const [darenPrice, setDarenPrice] = useState("");
  const [darenComm, setDarenComm] = useState("");

  // Common Inputs (Mode dependent)
  const [platformPoint, setPlatformPoint] = useState("");
  const [shipFee, setShipFee] = useState("");
  const [giftCost, setGiftCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [refundBefore, setRefundBefore] = useState("");
  const [refundAfter, setRefundAfter] = useState("");

  // Inputs for Promotion Profit/Loss
  const [actualSpend, setActualSpend] = useState("");
  const [actualROI, setActualROI] = useState("");
  const [extraFees, setExtraFees] = useState("");

  const [roiResult, setRoiResult] = useState<ROIResult | null>(null);
  const [promoProfit, setPromoProfit] = useState<string | null>(null);

  const [mode, setMode] = useState<'merchant' | 'daren'>('merchant');
  const [tab, setTab] = useState<'single' | 'multi'>('single');

  useEffect(() => {
    // Check if user is already VIP
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && (data.hasRoi || data.isVip)) {
            setHasRoi(true);
            const newUser = { ...user, hasRoi: data.hasRoi, isVip: data.isVip };
            localStorage.setItem('user', JSON.stringify(newUser));
          }
        })
        .catch(() => {
           if (user.hasRoi || user.isVip) setHasRoi(true);
        });
    }

    // Fetch VIP plans
    fetch('/api/settings/vip-plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVipPlans(data);
        } else {
          // Fallback default plans
          setVipPlans([
            { id: 'month', name: '月度会员', price: '19.9', label: '尝鲜首选', popular: false },
            { id: 'quarter', name: '季度会员', price: '39.9', label: '超值推荐', popular: true },
            { id: 'year', name: '年度会员', price: '88', label: '长期经营', popular: false },
            { id: 'forever', name: '永久会员', price: '188', label: '终身买断', popular: false },
          ]);
        }
      });
  }, []);

  const handlePay = async (plan: any) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('请先登录后购买');
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(userStr);

    setLoading(true);
    try {
      const res = await fetch('/api/payment/alipay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId: plan.id, type: 'roi' })
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
      setLoading(false);
    }
  };

  const confirmMockPay = async () => {
    if (!mockOrder) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payment/mock-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outTradeNo: mockOrder.outTradeNo })
      });
      const data = await res.json();
      if (data.success) {
        alert('购买成功！已为您开通ROI工具箱权限');
        setHasRoi(true);
        setMockOrder(null);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, hasRoi: true }));
      }
    } catch (e) {
      alert('确认支付失败');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRoi) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] font-sans pb-28">
        <div className="bg-gradient-to-br from-[#5978f5] to-[#8b55b7] pt-16 pb-12 px-6 text-center text-white rounded-b-[40px] shadow-lg">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 rotate-3">
             <Calculator size={40} />
          </div>
          <h1 className="text-2xl font-black mb-3">专业ROI工具箱</h1>
          <p className="text-sm opacity-80 max-w-[240px] mx-auto leading-relaxed">
            购买ROI工具箱套餐后即可解锁专业级盈利计算、投流模型分析工具
          </p>
        </div>

        <div className="px-5 -mt-6">
          <div className="grid grid-cols-2 gap-3">
            {vipPlans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => handlePay(plan)}
                className={`bg-white p-5 rounded-2xl border-2 relative overflow-hidden transition-all active:scale-95 ${plan.popular ? 'border-[#7d7cf2] shadow-md' : 'border-transparent'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#7d7cf2] text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">HOT</div>
                )}
                <div className="text-[12px] text-gray-400 mb-1">{plan.label}</div>
                <div className="text-[16px] font-black text-gray-800">{plan.name}</div>
                <div className="mt-4 flex items-baseline gap-0.5">
                  <span className="text-[12px] font-bold text-gray-500">¥</span>
                  <span className="text-[24px] font-black text-gray-900">{plan.price}</span>
                </div>
              </div>
            ))}
          </div>

          {mockOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="bg-[#7d7cf2] p-8 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                            <Calculator size={32} />
                        </div>
                        <h3 className="text-xl font-bold">支付确认</h3>
                        <p className="text-sm opacity-80 mt-1">请核对订单信息并完成支付</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">产品名称</span>
                                <span className="font-bold text-gray-800">ROI工具箱-{mockOrder.plan.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">订单编号</span>
                                <span className="text-gray-600 font-mono text-xs">{mockOrder.outTradeNo}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">支付金额</span>
                                <span className="text-2xl font-black text-[#7d7cf2]">¥{mockOrder.plan.price}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={confirmMockPay}
                                disabled={loading}
                                className="w-full py-4 bg-[#7d7cf2] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? '处理中...' : '模拟支付宝支付'}
                            </button>
                            <button 
                                onClick={() => setMockOrder(null)}
                                className="w-full mt-3 py-3 text-gray-400 text-sm font-medium"
                            >
                                取消订单
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}

          <button 
            onClick={() => {
              const firstPlan = vipPlans[0];
              if (firstPlan) handlePay(firstPlan);
            }}
            disabled={loading}
            className="w-full mt-8 py-4 bg-[#7d7cf2] text-white font-black text-[18px] rounded-2xl shadow-[0_10px_25px_rgba(125,124,242,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? '处理中...' : '立即解锁ROI工具箱'}
          </button>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">✓</div>
              <div>
                <p className="text-sm font-bold text-gray-800">专业盈利模型</p>
                <p className="text-xs text-gray-400">单SKU与多SKU混合销售占比分析</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">✓</div>
              <div>
                <p className="text-sm font-bold text-gray-800">投流盈亏测算</p>
                <p className="text-xs text-gray-400">实时测算投产ROI对利润的边际影响</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const addSku = () => {
    setSkuList([...skuList, { id: Date.now(), price: "", cost: "", ratio: "1" }]);
  };

  const removeSku = (id: number) => {
    if (skuList.length > 1) {
      setSkuList(skuList.filter(item => item.id !== id));
    }
  };

  const updateSku = (id: number, field: keyof SKUItem, value: string) => {
    setSkuList(skuList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleCalculateROI = () => {
    const pp = Number(platformPoint) / 100 || 0;
    const sf = Number(shipFee) || 0;
    const gc = Number(giftCost) || 0;
    const oc = Number(otherCost) || 0;
    const rb = Number(refundBefore) / 100 || 0;
    const ra = Number(refundAfter) / 100 || 0;

    let avgP = 0;
    let avgC = 0;

    if (mode === 'merchant') {
      if (tab === 'single') {
        avgP = Number(price);
        avgC = Number(cost);
      } else {
        let totalRatio = 0, weightedP = 0, weightedC = 0;
        skuList.forEach(sku => {
          const r = Number(sku.ratio) || 0;
          weightedP += (Number(sku.price) || 0) * r;
          weightedC += (Number(sku.cost) || 0) * r;
          totalRatio += r;
        });
        if (totalRatio === 0) return alert("请输入有效的销售比例");
        avgP = weightedP / totalRatio;
        avgC = weightedC / totalRatio;
      }
    } else {
      avgP = Number(darenPrice);
      // For Daren, "Cost" is effectively getting nothing from the product sale itself, 
      // but they get commission. We flip the logic.
      const commRate = Number(darenComm) / 100 || 0;
      if (!avgP || !commRate) return alert("请输入价格和佣金率");
      
      const effectiveCommRate = commRate * (1 - pp) * (1 - rb) * (1 - ra);
      const breakEvenROI = 1 / effectiveCommRate;
      
      setRoiResult({
        breakEvenROI: isFinite(breakEvenROI) ? breakEvenROI.toFixed(2) : "--",
        profitRate: (effectiveCommRate * 100).toFixed(2) + "%",
        breakEvenBid: (avgP * effectiveCommRate).toFixed(2)
      });
      return;
    }

    if (!avgP) return alert("请输入有效的价格");

    const effectiveRevenue = avgP * (1 - pp) * (1 - rb) * (1 - ra);
    const totalCosts = (avgC + gc + oc) * (1 - rb) + sf * (1 - rb); 
    const profit = effectiveRevenue - totalCosts;
    const profitRate = (profit / effectiveRevenue) * 100;
    const breakEvenROI = 1 / (profit / effectiveRevenue);

    if (profit <= 0) {
      alert("利润计算结果为负，请检查输入参数");
      setRoiResult(null);
      return;
    }

    setRoiResult({
      breakEvenROI: isFinite(breakEvenROI) ? breakEvenROI.toFixed(2) : "--",
      profitRate: profitRate.toFixed(2) + "%",
      breakEvenBid: profit.toFixed(2)
    });
  };

  const handleCalculatePromoProfit = () => {
    const spend = Number(actualSpend);
    const roiInput = Number(actualROI);
    const extra = Number(extraFees);
    const pp = Number(platformPoint) / 100 || 0;
    const sf = Number(shipFee) || 0;
    const rb = Number(refundBefore) / 100 || 0;
    const ra = Number(refundAfter) / 100 || 0;

    let avgP = 0, avgC = 0, commRate = 0;

    if (mode === 'merchant') {
      if (tab === 'single') {
        avgP = Number(price);
        avgC = Number(cost);
      } else {
        let totalRatio = 0, weightedP = 0, weightedC = 0;
        skuList.forEach(sku => {
          const r = Number(sku.ratio) || 0;
          weightedP += (Number(sku.price) || 0) * r;
          weightedC += (Number(sku.cost) || 0) * r;
          totalRatio += r;
        });
        avgP = weightedP / totalRatio;
        avgC = weightedC / totalRatio;
      }
    } else {
      avgP = Number(darenPrice);
      commRate = Number(darenComm) / 100 || 0;
    }

    if (!avgP || !spend || !roiInput) {
      return alert("请完整填写必要参数");
    }

    const sales = roiInput * spend;
    const orders = sales / avgP;
    
    let profit = 0;
    if (mode === 'merchant') {
      const netRevenue = sales * (1 - pp) * (1 - rb) * (1 - ra);
      const totalProductCosts = (avgC * orders) * (1 - rb);
      const totalShipping = (sf * orders) * (1 - rb);
      profit = netRevenue - totalProductCosts - totalShipping - spend - extra;
    } else {
      const netComm = sales * commRate * (1 - pp) * (1 - rb) * (1 - ra);
      profit = netComm - spend - extra;
    }

    setPromoProfit(profit.toFixed(2));
  };

  const InputRow = ({ 
    label, value, onChange, unit, showClear = false, placeholder = "", onClear 
  }: { 
    label: string; value: string; onChange: (v: string) => void; unit: string; showClear?: boolean; placeholder?: string; onClear?: () => void;
  }) => (
    <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-1 min-w-[100px]">
        <span className="text-red-500 text-lg leading-none mt-1">*</span>
        <span className="text-[15px] text-gray-700 font-medium">{label}</span>
      </div>
      <div className="flex-1 flex items-center justify-end gap-2 pr-4 relative">
        <input 
          type="number"
          value={value}
          placeholder={placeholder || `请输入${label}`}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-right bg-transparent outline-none text-[16px] text-gray-800 font-medium placeholder-gray-300"
        />
        {showClear && value && (
          <button onClick={onClear} className="bg-gray-400 rounded-full p-0.5 text-white"><X size={12} /></button>
        )}
      </div>
      <div className="text-[15px] text-gray-600 min-w-[24px] text-right">{unit}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-28">
      {/* Top Mode Selector */}
      <div className="bg-white px-2 py-3 flex gap-2">
        <button 
          onClick={() => { setMode('merchant'); setRoiResult(null); setPromoProfit(null); }}
          className={`flex-1 py-1 px-3 text-[14px] font-bold rounded-lg transition-all border ${mode === 'merchant' ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-400 border-gray-200'}`}
        >
          商家版本 (自发货)
        </button>
        <button 
          onClick={() => { setMode('daren'); setRoiResult(null); setPromoProfit(null); }}
          className={`flex-1 py-1 px-3 text-[14px] font-bold rounded-lg transition-all border ${mode === 'daren' ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-400 border-gray-200'}`}
        >
          达人版本 (推广码)
        </button>
      </div>

      {/* Tabs for Merchant Mode */}
      {mode === 'merchant' && (
        <div className="sticky top-0 z-30 bg-white p-1 shadow-sm flex">
          <button 
            onClick={() => setTab('single')}
            className={`flex-1 py-3 text-[16px] font-bold rounded-lg transition-all ${tab === 'single' ? 'bg-[#7d7cf2] text-white' : 'text-gray-800'}`}
          >
            单SKU计算
          </button>
          <button 
            onClick={() => setTab('multi')}
            className={`flex-1 py-3 text-[16px] font-bold rounded-lg transition-all ${tab === 'multi' ? 'bg-[#7d7cf2] text-white' : 'text-gray-800'}`}
          >
            多SKU计算
          </button>
        </div>
      )}

      <div className="mt-2">
        {mode === 'merchant' ? (
          tab === 'single' ? (
            <>
              <InputRow label="销售价格" value={price} onChange={setPrice} unit="元" />
              <InputRow label="产品成本" value={cost} onChange={setCost} unit="元" />
            </>
          ) : (
            <div className="bg-white px-4 py-2 space-y-4">
              {skuList.map((sku, index) => (
                <div key={sku.id} className="p-4 bg-gray-50 rounded-2xl relative border border-gray-100">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400">
                    <span>SKU {index + 1}</span>
                    {skuList.length > 1 && (
                      <button onClick={() => removeSku(sku.id)} className="text-red-400 flex items-center gap-1"><Trash2 size={12} /> 删除</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">价格 (元)</label>
                      <input type="number" value={sku.price} onChange={(e) => updateSku(sku.id, 'price', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">成本 (元)</label>
                      <input type="number" value={sku.cost} onChange={(e) => updateSku(sku.id, 'cost', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-gray-400 mb-1 block">销售占比 (权重)</label>
                    <input type="number" value={sku.ratio} onChange={(e) => updateSku(sku.id, 'ratio', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none" />
                  </div>
                </div>
              ))}
              <button onClick={addSku} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2"><Plus size={16} /> 添加 SKU</button>
            </div>
          )
        ) : (
          <>
            <InputRow label="销售价格" value={darenPrice} onChange={setDarenPrice} unit="元" />
            <InputRow label="带货佣金" value={darenComm} onChange={setDarenComm} unit="%" />
          </>
        )}

        <div className="mt-2">
          <InputRow label="平台扣点" value={platformPoint} onChange={setPlatformPoint} unit="%" />
          {mode === 'merchant' && <InputRow label="运费" value={shipFee} onChange={setShipFee} unit="元" showClear onClear={() => setShipFee("")} />}
          {mode === 'merchant' && <InputRow label="赠品成本" value={giftCost} onChange={setGiftCost} unit="元" />}
          {mode === 'merchant' && <InputRow label="其他成本" value={otherCost} onChange={setOtherCost} unit="元" />}
          <InputRow label="发货前退款率" value={refundBefore} onChange={setRefundBefore} unit="%" placeholder="发货前退款率" />
          <InputRow label="发货后退款率" value={refundAfter} onChange={setRefundAfter} unit="%" placeholder="发货后退款率" />
        </div>
      </div>

      <div className="bg-[#f2f6ff] px-6 py-5 flex flex-wrap justify-between items-center text-[#7d7cf2] gap-y-1">
        <div className="w-1/2">
          <p className="text-[15px] font-medium">保本投产ROI: <span className="font-bold">{roiResult?.breakEvenROI || '--'}</span></p>
          <p className="text-[15px] font-medium">{mode === 'merchant' ? '保本成交额' : '预估佣金'}: <span className="font-bold">{roiResult?.breakEvenBid || '--'}</span></p>
        </div>
        <div className="w-1/2 text-right">
          <p className="text-[15px] font-medium">{mode === 'merchant' ? '综合利润率' : '净佣金率'}: <span className="font-bold">{roiResult?.profitRate || '--'}</span></p>
        </div>
      </div>

      <div className="px-3 mt-4">
        <button onClick={handleCalculateROI} className="w-full py-4 bg-[#7d7cf2] text-white font-bold text-[18px] rounded-xl shadow-lg active:scale-[0.98] transition-all">计算 ROI</button>
      </div>

      <div className="mt-10 border-t border-gray-100 bg-white">
        <div className="px-4 py-3 bg-gray-50 text-[13px] font-bold text-gray-400 tracking-wider">推广盈亏分析</div>
        <InputRow label="实际花费" value={actualSpend} onChange={setActualSpend} unit="元" />
        <InputRow label="实际投产ROI" value={actualROI} onChange={setActualROI} unit="" />
        <InputRow label="补充费用" value={extraFees} onChange={setExtraFees} unit="元" />
      </div>

      <div className={`bg-[#f2f6ff] px-6 py-5 transition-all ${promoProfit ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
        <p className="text-[17px] font-bold text-[#7d7cf2]">推广预测盈亏: <span className="text-[20px]">{promoProfit || '--'}</span> <span className="text-sm font-normal">元</span></p>
      </div>

      <div className="px-3 mt-4">
        <button onClick={handleCalculatePromoProfit} className="w-full py-4 bg-[#7d7cf2] text-white font-bold text-[18px] rounded-xl shadow-lg active:scale-[0.98] transition-all">计算推广盈亏</button>
      </div>

      <div className="mt-10 mb-10 flex flex-col items-center gap-4 text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px] bg-gray-200"></div><span className="text-[10px] uppercase tracking-widest font-bold">新塘档口计算器</span><div className="w-8 h-[1px] bg-gray-200"></div>
        </div>
        <button 
          onClick={() => {
            setPrice(""); setCost(""); setPlatformPoint(""); setShipFee(""); setGiftCost(""); setOtherCost("");
            setRefundBefore(""); setRefundAfter(""); setActualSpend(""); setActualROI(""); setExtraFees("");
            setDarenPrice(""); setDarenComm(""); setRoiResult(null); setPromoProfit(null);
            setSkuList([{ id: Date.now(), price: "", cost: "", ratio: "1" }]);
          }}
          className="text-xs font-medium text-gray-400 hover:text-[#7d7cf2] transition-colors"
        >
          清空所有数据
        </button>
      </div>
    </div>
  );
}

