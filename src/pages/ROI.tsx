import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

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
  const [mode, setMode] = useState<'merchant' | 'daren'>('merchant');
  const [tab, setTab] = useState<'single' | 'multi'>('single');
  
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
          <InputRow label="前退款率" value={refundBefore} onChange={setRefundBefore} unit="%" placeholder="发货前退款率" />
          <InputRow label="后退款率" value={refundAfter} onChange={setRefundAfter} unit="%" placeholder="发货后退款率" />
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

