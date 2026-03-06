import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import db from '../utils/db';
import Toast from './Toast';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // 加载收藏数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await db.initDB();
        const data = await db.getAllCollections();
        setCollections(data);
      } catch (error) {
        console.error('加载收藏数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 删除收藏
  const handleDeleteCollection = async () => {
    if (!deletingItem) return;

    try {
      await db.deleteCollection(deletingItem.id);
      setCollections((prev) =>
        prev.filter((item) => item.id !== deletingItem.id)
      );
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('删除失败:', error);
      Toast.fail('删除失败，请重试');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F7] pb-24">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">我的收藏</h1>
      </div>

      {/* 瀑布流展示区 */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index}>
                <div className="bg-white rounded-2xl p-3 shadow-sm aspect-square animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>还没有收藏的穿搭</p>
            <p className="text-sm mt-2">去搭配画布创建并保存你的第一个穿搭吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((collection) => (
              <div key={collection.id}>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative group">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 删除按钮 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setDeletingItem(collection);
                          setShowDeleteConfirm(true);
                        }}
                        className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {collection.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && deletingItem && (
        <div className="fixed inset-0 bg-black/50 z-999 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-80 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-gray-500 text-sm mb-6">
                确定要删除「{deletingItem.name}」吗？此操作无法撤销。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingItem(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCollection}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
