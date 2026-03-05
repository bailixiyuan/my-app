import React from "react";

const Profile = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F7] pb-24">
      {/* 顶部个人信息 */}
      <div className="bg-white p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 font-bold text-xl">用户</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-800">我的衣橱</h2>
            <p className="text-gray-500 text-sm">管理个人穿搭</p>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 bg-white mt-4 p-4">
        <div className="text-center">
          <p className="font-bold text-xl text-gray-800">24</p>
          <p className="text-gray-500 text-xs">总衣物</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-gray-800">12</p>
          <p className="text-gray-500 text-xs">已穿搭</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-gray-800">8</p>
          <p className="text-gray-500 text-xs">收藏搭配</p>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="bg-white mt-4">
        <div className="border-b border-gray-100">
          <button className="w-full p-4 flex items-center justify-between text-left">
            <span className="text-gray-800">我的收藏</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div className="border-b border-gray-100">
          <button className="w-full p-4 flex items-center justify-between text-left">
            <span className="text-gray-800">穿搭记录</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div className="border-b border-gray-100">
          <button className="w-full p-4 flex items-center justify-between text-left">
            <span className="text-gray-800">设置</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div>
          <button className="w-full p-4 flex items-center justify-between text-left">
            <span className="text-gray-800">关于</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="mt-8 px-6">
        <p className="text-center text-gray-400 text-xs">
          版本 1.0.0
        </p>
      </div>
    </div>
  );
};

export default Profile;