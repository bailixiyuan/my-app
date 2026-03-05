import React from "react";
import { MapPin, Sun, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { CLOTHING_DATA } from "../data/data";

const AIStylist = ({ onTryOn }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F7] pb-24 px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI 造型师</h1>

      {/* 顶部天气卡片 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm mb-6 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center text-gray-500 mb-1">
            <MapPin size={14} className="mr-1" />
            <span className="text-xs">当前位置：市中心</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">22°C 晴朗</h2>
          <p className="text-sm text-gray-500 mt-1">微风，适合出行</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-2xl text-orange-400">
          <Sun size={32} />
        </div>
      </div>

      {/* 核心展示区 - 搭配轮播卡片 */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden relative">
        <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur px-3 py-1 rounded-full flex items-center">
          <Sparkles size={14} className="text-yellow-300 mr-1" />
          <span className="text-xs text-white">AI 推荐 98% 匹配度</span>
        </div>

        {/* 模拟拼图搭配图 */}
        <div className="aspect-[4/5] bg-gray-50 p-6 flex flex-col items-center justify-center relative">
          <img
            src={CLOTHING_DATA[0].src}
            className="w-1/2 h-40 object-cover rounded-xl mix-blend-multiply absolute top-10 left-10 shadow-sm rotate-[-5deg]"
            alt="top"
          />
          <img
            src={CLOTHING_DATA[1].src}
            className="w-1/2 h-48 object-cover rounded-xl mix-blend-multiply absolute top-32 right-10 shadow-sm rotate-[3deg]"
            alt="bottom"
          />
          <img
            src={CLOTHING_DATA[3].src}
            className="w-1/3 h-24 object-cover rounded-xl mix-blend-multiply absolute bottom-10 left-20 shadow-sm"
            alt="shoes"
          />
        </div>

        {/* 推荐语与操作区 */}
        <div className="p-5 bg-white">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            复古清爽休闲 Look
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            今日气温适宜，推荐这套基础白T搭配直筒牛仔裤，配上舒适的运动板鞋。简约而不简单，适合逛街或喝下午茶。
          </p>

          <div className="flex space-x-4">
            <button className="flex-1 flex items-center justify-center py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:scale-95 transition-all">
              <RefreshCw size={18} className="mr-2" />
              换一套
            </button>
            <button
              onClick={onTryOn}
              className="flex-1 flex items-center justify-center py-3.5 rounded-2xl bg-gray-800 text-white font-medium hover:bg-gray-900 active:scale-95 transition-all shadow-md shadow-gray-800/30"
            >
              去试穿
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStylist;
