import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  // API Key 状态
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // 自动抠图开关状态
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);

  // 从 localStorage 加载配置
  useEffect(() => {
    // 加载 API Key
    const savedApiKey = localStorage.getItem('removeBgApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // 默认 API Key
      const defaultApiKey = 'd2zaM4gm7j2KdnHMooiTWChU';
      setApiKey(defaultApiKey);
      localStorage.setItem('removeBgApiKey', defaultApiKey);
    }

    // 加载自动抠图开关状态
    const savedAutoRemoveBg = localStorage.getItem('autoRemoveBg');
    if (savedAutoRemoveBg !== null) {
      setAutoRemoveBg(savedAutoRemoveBg === 'true');
    } else {
      // 默认开启
      localStorage.setItem('autoRemoveBg', 'true');
    }
  }, []);

  // 保存 API Key
  const handleSaveApiKey = () => {
    localStorage.setItem('removeBgApiKey', apiKey);
    setIsEditing(false);
    setSaveSuccess(true);
    // 3秒后隐藏成功提示
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F7] pb-24">
      {/* 顶部个人信息 */}
      <div className="bg-white p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop&crop=face"
              alt="用户头像"
              className="w-full h-full object-cover"
            />
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
          <Link
            to="/collections"
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <span className="text-gray-800">我的收藏</span>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
        <div className="border-b border-gray-100">
          <button className="w-full p-4 flex items-center justify-between text-left">
            <span className="text-gray-800">穿搭记录</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div className="border-b border-gray-100">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-800">配置</span>
            </div>
            <div className="space-y-4">
              {/* 自动抠图开关 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">自动抠图</span>
                  <p className="text-xs text-gray-400 mt-1">
                    开启后上传图片会自动去除背景
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={(e) => {
                      setAutoRemoveBg(e.target.checked);
                      localStorage.setItem(
                        'autoRemoveBg',
                        e.target.checked.toString()
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
              </div>

              {/* 抠图 API Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">抠图 API Key</span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-blue-600"
                    >
                      编辑
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveApiKey}
                        className="flex-1 p-2 bg-gray-800 text-white rounded-lg text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // 恢复原始值
                          const savedApiKey =
                            localStorage.getItem('removeBgApiKey');
                          if (savedApiKey) {
                            setApiKey(savedApiKey);
                          }
                        }}
                        className="flex-1 p-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 font-mono overflow-x-auto">
                    {apiKey}
                  </div>
                )}
                {saveSuccess && (
                  <div className="mt-2 text-sm text-green-600">保存成功！</div>
                )}
              </div>
            </div>
          </div>
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
        <p className="text-center text-gray-400 text-xs">版本 1.0.0</p>
      </div>
    </div>
  );
};

export default Profile;
