import React, { useState, useEffect, useRef } from 'react';
import { Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import db from '../utils/db';
import Toast from './Toast';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionClothes, setCollectionClothes] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  // 长按删除相关状态
  const [longPressItem, setLongPressItem] = useState(null);
  const longPressTimer = useRef(null);

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
      setLongPressItem(null); // 清除长按状态
      // 如果当前显示的是被删除的收藏详情，关闭详情
      if (selectedCollection && selectedCollection.id === deletingItem.id) {
        setShowDetail(false);
        setSelectedCollection(null);
        setCollectionClothes([]);
      }
    } catch (error) {
      console.error('删除失败:', error);
      Toast.fail('删除失败，请重试');
    }
  };

  // 查看收藏详情
  const handleViewCollection = async (collection) => {
    try {
      setDetailLoading(true);
      setSelectedCollection(collection);

      // 获取收藏关联的衣物
      if (collection.clothingIds && collection.clothingIds.length > 0) {
        const clothes = await db.getClothesByIds(collection.clothingIds);
        setCollectionClothes(clothes);
      } else {
        setCollectionClothes([]);
      }

      setShowDetail(true);
    } catch (error) {
      console.error('获取收藏详情失败:', error);
      Toast.fail('获取详情失败，请重试');
    } finally {
      setDetailLoading(false);
    }
  };

  // 关闭详情
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedCollection(null);
    setCollectionClothes([]);
  };

  // 长按开始
  const handleTouchStart = (item) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressItem(item);
    }, 500);
  };

  // 长按结束/取消
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // 不清除 longPressItem，让删除图标保持显示直到用户操作
  };

  // 点击删除图标
  const handleDeleteIconClick = (e, item) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发详情查看
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  // 取消删除操作
  const handleCancelDelete = () => {
    setLongPressItem(null);
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
                <div
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-all ${
                    longPressItem?.id === collection.id
                      ? 'ring-2 ring-red-400'
                      : ''
                  }`}
                  onClick={() => handleViewCollection(collection)}
                  onMouseDown={() => handleTouchStart(collection)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                  onTouchStart={() => handleTouchStart(collection)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 删除和取消按钮 */}
                    {longPressItem?.id === collection.id && (
                      <div className="absolute top-2 left-2 flex space-x-2">
                        <div
                          onClick={(e) => handleDeleteIconClick(e, collection)}
                          className="bg-red-500 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelDelete();
                          }}
                          className="bg-gray-500 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </div>
                      </div>
                    )}
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

      {/* 删除确认抽屉 */}
      {showDeleteConfirm &&
        deletingItem &&
        createPortal(
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 bg-black/50 z-999 animate-fade-in"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fade-in 0.2s ease-out forwards',
              }}
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingItem(null);
              }}
            />
            {/* 抽屉内容 */}
            <div
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl w-full max-w-md p-6 shadow-2xl transform transition-transform duration-300 ease-in-out z-1000 animate-slide-up mx-auto"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                maxWidth: '28rem',
                width: '100%',
                zIndex: 1000,
                animation:
                  'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  确认删除
                </h3>
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
          </>,
          document.body
        )}
      {/* 收藏详情抽屉 */}
      {showDetail &&
        selectedCollection &&
        createPortal(
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 bg-black/50 z-999 animate-fade-in"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fade-in 0.2s ease-out forwards',
              }}
              onClick={handleCloseDetail}
            />
            {/* 抽屉内容 */}
            <div
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-in-out z-1000 animate-slide-up"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                animation:
                  'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部关闭按钮 */}
              <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-gray-100 rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-800">穿搭详情</h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="p-6 pb-4">
                {/* 穿搭名称 */}
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedCollection.name}
                </h2>

                {/* 穿搭图片 */}
                <div className="bg-gray-100 rounded-2xl overflow-hidden mb-6">
                  <img
                    src={selectedCollection.image}
                    alt={selectedCollection.name}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* 穿搭备注 */}
                {selectedCollection.note && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      备注
                    </h3>
                    <p className="text-gray-700">{selectedCollection.note}</p>
                  </div>
                )}

                {/* 创建时间 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    创建时间
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedCollection.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* 相关衣物 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">
                    相关衣物
                  </h3>
                  {detailLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 rounded-xl aspect-square animate-pulse"
                        ></div>
                      ))}
                    </div>
                  ) : collectionClothes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {collectionClothes.map((clothing) => (
                        <div
                          key={clothing.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                          <div className="aspect-square bg-gray-50 flex items-center justify-center">
                            <img
                              src={clothing.src}
                              alt={clothing.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <h4 className="text-xs font-semibold text-gray-800 truncate">
                              {clothing.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              穿过 {clothing.timesWorn || 0} 次
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">暂无相关衣物</p>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default Collections;
