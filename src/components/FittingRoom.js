import React from "react";
import { Wind, Shirt, Palette, Sparkles, Heart, Camera, Share2 } from "lucide-react";
import { CLOTHING_DATA } from "../data/data";

const FittingRoom = () => {
  return (
    <div className="flex-1 bg-gray-900 relative pb-20 overflow-hidden">
      {/* 主视觉区：模拟 3D / AR 模特 */}
      <img
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
        alt="Virtual Model"
        className="w-full h-full object-cover opacity-90"
      />

      {/* 顶部状态栏 */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-white text-xl font-bold text-shadow">3D 试衣间</h1>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white text-xs flex items-center">
          <Wind size={14} className="mr-1" /> 身高 165cm / 体重 50kg
        </div>
      </div>

      {/* 侧边控制栏 - 快速换装 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        {
          [
            { icon: <Shirt size={20} />, active: true, label: "上衣" },
            { icon: <Palette size={20} />, active: false, label: "下装" },
            { icon: <Sparkles size={20} />, active: false, label: "配饰" },
          ].map((btn, idx) => (
            <div key={idx} className="relative group">
              <button
                className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  btn.active
                    ? "bg-white text-gray-900 border-2 border-white"
                    : "bg-black/40 text-white border border-white/20 hover:bg-black/60"
                }`}
              >
                {btn.icon}
              </button>
              {/* 选中状态下弹出的小列表 */}
              {btn.active && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-lg rounded-2xl p-2 flex flex-col space-y-2 shadow-2xl animate-fade-in">
                  <img
                    src={CLOTHING_DATA[0].src}
                    className="w-12 h-12 rounded-lg bg-gray-100 object-cover mix-blend-multiply border border-gray-800"
                    alt="swap"
                  />
                  <img
                    src={CLOTHING_DATA[4].src}
                    className="w-12 h-12 rounded-lg bg-gray-100 object-cover mix-blend-multiply opacity-50 hover:opacity-100"
                    alt="swap"
                  />
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* 底部操作区 */}
      <div className="absolute bottom-24 inset-x-0 px-8 flex justify-between items-center">
        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/30">
          <Heart size={22} />
        </button>

        {/* 快门按钮 */}
        <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center p-1">
          <div className="w-full h-full bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            <Camera size={28} className="text-gray-800" />
          </div>
        </button>

        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/30">
          <Share2 size={22} />
        </button>
      </div>
    </div>
  );
};

export default FittingRoom;
