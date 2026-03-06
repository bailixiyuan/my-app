/*
 * @Author: 陈豪
 * @Date: 2026-03-05 14:07:46
 * @description: file description
 * @LastEditors: 陈豪
 * @LastEditTime: 2026-03-06 09:33:13
 * @FilePath: \my-app\src\App.js
 */
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { Shirt, Palette, User } from 'lucide-react';
import Wardrobe from './components/Wardrobe';
import Canvas from './components/Canvas';
import Profile from './components/Profile';

// 导入测试数据脚本
import './utils/test-data';

// 底部导航组件
const BottomNav = () => {
  const location = useLocation();

  // 导航配置
  const navItems = [
    { id: '/', label: '衣橱', icon: <Shirt size={22} /> },
    { id: '/canvas', label: '画布', icon: <Palette size={22} /> },
    { id: '/profile', label: '我的', icon: <User size={22} /> },
  ];

  return (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-around items-center h-20 px-2 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.id;
          return (
            <Link
              key={item.id}
              to={item.id}
              className={`flex flex-col items-center justify-center w-full space-y-1 transition-all duration-300 ${
                isActive
                  ? 'text-gray-900 scale-110'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${isActive ? 'bg-gray-100' : 'bg-transparent'}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      {/* 限制最大宽度，在PC上居中模拟手机尺寸，在手机上全屏 */}
      <div className="w-full h-screen max-w-md mx-auto bg-black flex flex-col relative font-sans sm:shadow-2xl sm:border-x sm:border-gray-800 overflow-hidden">
        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<Wardrobe />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        {/* 底部全局导航栏 (Bottom Navigation) */}
        <BottomNav />

        {/* 针对 iOS 的底部安全区适配 (可选) */}
        <style>{`
          .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          @keyframes fade-in {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(4px); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </Router>
  );
}
