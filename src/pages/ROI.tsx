import { useState, useEffect } from "react";
import { Calculator, Info, RotateCcw } from "lucide-react";

type Version = 'influencer' | 'merchant';

export default function ROI() {
  const [version, setVersion] = useState<Version>('influencer');
  
  // Influencer Inputs
  const [infPrice, setInfPrice] = useState("");
  const [infComm, setInfComm] = useState("");
  const [infReturn, setInfReturn] = useState("0");
  const [infWithdraw, setInfWithdraw] = useState("0");
  const [infRefund1h, setInfRefund1h] = useState("0");

  // Merchant Inputs
  const [merPrice, setMerPrice] = useState("");
  const [merCost, setMerCost] = useState("");
  const [merReturn, setMerReturn] = useState("0");
  const [merPlatform, setMerPlatform] = useState("0");
  const [merRefund1h, setMerRefund1h] = useState("0");

  const [results, setResults] = useState<any>(null);

  const calculateInfluencer = () => {
    if (!infPrice || !infComm) {
      alert("请填写关键必填项（商品价格、佣金率）");
      return;
    }
    const price = Number(infPrice);
    const comm = Number(infComm) / 100;
    const ret = Number(infReturn) / 100;
    const withdraw = Number(infWithdraw) / 100;
    const refund1h = Number(infRefund1h) / 100;

    // Based on the formula: Break-even ROI = Price / NetRevenue
    // NetRevenue = Price * Comm * (1 - 1hRefund) * (1 - ReturnRate) * (1 - WithdrawalFee)
    const netRevenuePerOrder = price * comm * (1 - refund1h) * (1 - ret) * (1 - withdraw);
    
    if (netRevenuePerOrder <= 0) {
      alert("纯利润过低，无法计算ROI（请检查费率设置）");
      return;
    }

    const breakEvenROI = price / netRevenuePerOrder;

    setResults({
      type: 'influencer',
      breakEvenROI: breakEvenROI.toFixed(3),
      estimatedROI: (price / (price * comm)).toFixed(3), // Base ROI without fees
      grossProfit: (price * comm).toFixed(2),
      netProfit: (netRevenuePerOrder).toFixed(2),
      netROI: breakEvenROI.toFixed(3)
    });
  };

  const calculateMerchant = () => {
    if (!merPrice || !merCost) {
      alert("请填写关键必填项（商品售价、成本）");
      return;
    }
    const price = Number(merPrice);
    const cost = Number(merCost);
    const ret = Number(merReturn) / 100;
    const platform = Number(merPlatform) / 100;
    const refund1h = Number(merRefund1h) / 100;

    const grossProfit = price * (1 - platform) - cost;
    const netProfitPerSale = grossProfit * (1 - refund1h) * (1 - ret);
    
    if (netProfitPerSale <= 0) {
      alert("利润为负或过低，无法计算ROI");
      return;
    }

    const grossProfitRate = (grossProfit / price) * 100;
    const netProfitRate = (netProfitPerSale / price) * 100;
    const breakEvenROI = price / netProfitPerSale;

    setResults({
      type: 'merchant',
      breakEvenROI: breakEvenROI.toFixed(3),
      estimatedROI: (price / grossProfit).toFixed(3),
      grossProfit: grossProfit.toFixed(2),
      netProfit: netProfitPerSale.toFixed(2),
      grossProfitRate: grossProfitRate.toFixed(2),
      netProfitRate: netProfitRate.toFixed(2)
    });
  };

  useEffect(() => {
    setResults(null); 
  }, [version]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24 font-sans">
      {/* Tab Switcher */}
      <div className="bg-white px-6 pt-10 pb-4 shadow-sm relative z-10">
        <div className="flex bg-[#f0f2f5] p-1 rounded-xl">
          <button 
            onClick={() => setVersion('influencer')}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all ${version === 'influencer' ? 'bg-white text-[#44a0fe] shadow-sm' : 'text-[#8a919f]'}`}
          >
            达人版
          </button>
          <button 
            onClick={() => setVersion('merchant')}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all ${version === 'merchant' ? 'bg-white text-[#44a0fe] shadow-sm' : 'text-[#8a919f]'}`}
          >
            商家版
          </button>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="mb-4">
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">一眼看懂ROI</h1>
          <p className="text-[12px] text-[#86868b]">{version === 'influencer' ? '达人推广场景' : '商家销售场景'}</p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0]">
          {version === 'influencer' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] text-[#333] font-medium block mb-1.5 ml-1">商品价格 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={infPrice}
                      onChange={(e) => setInfPrice(e.target.value)}
                      className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none ring-1 ring-transparent focus:ring-[#44a0fe]/30 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">元</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[12px] text-[#333] font-medium block mb-1.5 ml-1">佣金率 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={infComm}
                      onChange={(e) => setInfComm(e.target.value)}
                      className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none ring-1 ring-transparent focus:ring-[#44a0fe]/30 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-[11px] text-[#44a0fe] font-bold mb-3 flex items-center gap-1">
                  <Info size={12} /> 高级选项 (可选)
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[12px] text-[#666] block mb-1.5 ml-1">退货率</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={infReturn}
                        onChange={(e) => setInfReturn(e.target.value)}
                        className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] text-[#666] block mb-1.5 ml-1">提现费率</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={infWithdraw}
                        onChange={(e) => setInfWithdraw(e.target.value)}
                        className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[12px] text-[#666] block mb-1.5 ml-1">1h退款率</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={infRefund1h}
                    onChange={(e) => setInfRefund1h(e.target.value)}
                    className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] text-[#333] font-medium block mb-1.5 ml-1">商品售价 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={merPrice}
                      onChange={(e) => setMerPrice(e.target.value)}
                      className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none ring-1 ring-transparent focus:ring-[#44a0fe]/30 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">元</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[12px] text-[#333] font-medium block mb-1.5 ml-1">商品成本 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={merCost}
                      onChange={(e) => setMerCost(e.target.value)}
                      className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none ring-1 ring-transparent focus:ring-[#44a0fe]/30 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">元</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-[#44a0fe] font-bold mb-3 flex items-center gap-1">
                  <Info size={12} /> 高级选项 (可选)
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[12px] text-[#666] block mb-1.5 ml-1">退货率</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={merReturn}
                        onChange={(e) => setMerReturn(e.target.value)}
                        className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] text-[#666] block mb-1.5 ml-1">平台费率</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={merPlatform}
                        onChange={(e) => setMerPlatform(e.target.value)}
                        className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[12px] text-[#666] block mb-1.5 ml-1">1h退款率</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={merRefund1h}
                    onChange={(e) => setMerRefund1h(e.target.value)}
                    className="w-full bg-[#f8f9fb] border-none rounded-xl px-4 py-3 text-[14px] font-bold outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#999]">%</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={version === 'influencer' ? calculateInfluencer : calculateMerchant}
            className="w-full mt-6 bg-gradient-to-r from-[#5caaff] to-[#44a0fe] text-white py-3.5 rounded-2xl font-bold text-[16px] shadow-[0_8px_20px_rgba(68,160,254,0.3)] active:scale-[0.98] transition-all"
          >
            开始计算
          </button>
        </div>

        {/* Results Area */}
        {results && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-[1px] w-8 bg-gray-200"></span>
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest leading-none">计算结果</span>
              <span className="h-[1px] w-8 bg-gray-200"></span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-[#6ebefd] to-[#44a0fe] p-4 rounded-2xl text-white shadow-lg shadow-blue-100 flex flex-col items-center justify-center">
                <div className="text-[11px] font-medium opacity-80 mb-0.5">保本ROI</div>
                <div className="text-[20px] font-black">{results.breakEvenROI}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#f0f0f0] shadow-sm flex flex-col items-center justify-center">
                <div className="text-[11px] font-medium text-gray-400 mb-0.5">预估ROI</div>
                <div className="text-[20px] font-black text-gray-800">{results.estimatedROI}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-[#f0f0f0] shadow-sm">
              <div className="divide-y divide-[#f9f9f9]">
                {version === 'influencer' ? (
                  <>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500">毛利佣金</span>
                      <span className="text-[14px] font-bold text-gray-800">¥{results.grossProfit}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500">纯利佣金</span>
                      <span className="text-[14px] font-bold text-gray-800">¥{results.netProfit}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500 font-medium">净成交保本ROI</span>
                      <span className="text-[14px] font-bold text-[#44a0fe]">{results.netROI}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500">毛利润</span>
                      <span className="text-[14px] font-bold text-gray-800">¥{results.grossProfit}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500">纯利润</span>
                      <span className="text-[14px] font-bold text-gray-800">¥{results.netProfit}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500">毛利润率</span>
                      <span className="text-[14px] font-bold text-gray-800">{results.grossProfitRate}%</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-[13px] text-gray-500 font-medium">纯利润率</span>
                      <span className="text-[14px] font-bold text-[#44a0fe]">{results.netProfitRate}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 bg-[#f0f8ff] border border-[#e1efff] px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-sm text-[12px]">💡</div>
              <p className="text-[12px] text-[#44a0fe] font-medium">
                投流ROI需达到 <span className="font-black text-[14px] mx-0.5">{results.breakEvenROI}</span> 才能保本
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 px-6 text-center">
        <button 
          onClick={() => setResults(null)}
          className="inline-flex items-center gap-1.5 text-[12px] text-gray-300 hover:text-[#44a0fe] transition-colors"
        >
          <RotateCcw size={14} /> 重置所有数据
        </button>
      </div>
    </div>
  );
}
