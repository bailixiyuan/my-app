import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Save,
  Trash2,
} from 'lucide-react';
import { AVAILABLE_TAGS, CAT_MAP, CATEGORIES } from '../data/data';
import db from '../utils/db';
import Toast from './Toast';

const Wardrobe = () => {
  const [activeCat, setActiveCat] = useState('全部');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [clothingData, setClothingData] = useState([]);

  // 分页相关状态
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: 'top',
    season: '夏',
    tags: [],
    src: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&q=80',
    timesWorn: 0,
  });

  // 编辑模式状态
  const [editMode, setEditMode] = useState(false);
  const [currentClothingId, setCurrentClothingId] = useState(null);

  // 新标签输入状态
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // 可用标签列表（包含默认标签和自定义标签）
  const [availableTags, setAvailableTags] = useState(AVAILABLE_TAGS);

  // 新标签输入容器引用
  const newTagInputContainerRef = useRef(null);

  // 抠图加载状态
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  // 抠图成功状态
  const [bgRemoved, setBgRemoved] = useState(false);

  // 长按删除相关状态
  const [longPressItem, setLongPressItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const longPressTimer = useRef(null);

  // 滚动容器引用
  const scrollContainerRef = useRef(null);

  // 初始化数据库并加载数据
  useEffect(() => {
    // 清空搜索条件和筛选条件
    setActiveCat('全部');
    setSelectedTags([]);
    setSearchQuery('');
    // 重置分页条件
    setPage(1);
    setHasMore(true);

    const loadData = async () => {
      try {
        await db.initDB();
        // 加载所有数据用于搜索和筛选
        const allData = await db.getAllClothing();
        setClothingData(allData);
        setHasMore(allData.length > pageSize);
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    loadData();
  }, [pageSize]);

  // 实现分类、标签和搜索的多重过滤
  const filteredData = clothingData.filter((item) => {
    // 分类筛选：当选择"全部"时显示所有，否则匹配对应类型
    const matchCat = activeCat === '全部' || item.type === CAT_MAP[activeCat];

    // 标签筛选：多选模式，选中多个标签时要求同时满足
    const matchTag =
      selectedTags.length === 0 ||
      (item.tags && selectedTags.every((tag) => item.tags.includes(tag)));

    // 搜索功能：匹配名称、标签、季节（不区分大小写）
    const searchLower = searchQuery.toLowerCase().trim();
    const matchSearch =
      searchQuery.trim() === '' ||
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.tags &&
        item.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
      (item.season && item.season.toLowerCase().includes(searchLower));

    return matchCat && matchTag && matchSearch;
  });

  // 分页显示的数据
  const displayData = filteredData.slice(0, page * pageSize);

  // 处理文件上传
  const handleFileUpload = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. 读取文件为 base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const imageUrl = e.target.result;
            // 检查是否开启自动抠图
            const autoRemoveBg =
              localStorage.getItem('autoRemoveBg') === 'true';

            // 显示原图
            setFormData((prevFormData) => ({ ...prevFormData, src: imageUrl }));

            if (autoRemoveBg) {
              // 开启了自动抠图
              setIsRemovingBg(true);
              setBgRemoved(false); // 重置抠图成功状态

              // 调用 Remove.bg API 进行抠图
              const API_KEY =
                localStorage.getItem('removeBgApiKey') ||
                'd2zaM4gm7j2KdnHMooiTWChU';
              const apiFormData = new FormData();
              apiFormData.append('image_file', dataURLToBlob(imageUrl));
              apiFormData.append('size', 'auto');

              const response = await fetch(
                'https://api.remove.bg/v1.0/removebg',
                {
                  method: 'POST',
                  headers: {
                    'X-Api-Key': API_KEY,
                  },
                  body: apiFormData,
                }
              );

              if (!response.ok) {
                throw new Error('API 调用失败');
              }

              const blob = await response.blob();
              // 将 blob 转换为 base64 格式
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64Image = e.target.result;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  src: base64Image,
                }));
                setIsRemovingBg(false);
                setBgRemoved(true); // 设置抠图成功状态
                resolve(base64Image);
              };
              reader.onerror = (error) => {
                setIsRemovingBg(false);
                reject(error);
              };
              reader.readAsDataURL(blob);
            } else {
              // 未开启自动抠图，直接返回原图
              setIsRemovingBg(false);
              setBgRemoved(false);
              resolve(imageUrl);
            }
          } catch (error) {
            console.error('抠图失败:', error);
            setIsRemovingBg(false);
            setBgRemoved(false); // 抠图失败，重置状态
            // 抠图失败时显示原图
            const imageUrl = e.target.result;
            resolve(imageUrl);
          }
        };
        reader.onerror = (error) => {
          setIsRemovingBg(false);
          reject(error);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setIsRemovingBg(false);
        reject(error);
      }
    });
  };

  // 将 dataURL 转换为 Blob
  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 拍照录入
  const handleTakePhoto = () => {
    setShowActionMenu(false);
    // 创建一个文件输入元素，设置为拍照模式
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          // 先显示上传界面，再处理文件上传
          setShowUpload(true);
          // 处理文件上传和抠图
          await handleFileUpload(e.target.files[0]);
        } catch (error) {
          console.error('拍照失败:', error);
        }
      }
    };
    input.click();
  };

  // 从相册选择
  const handlePickFromGallery = () => {
    setShowActionMenu(false);
    // 创建一个文件输入元素，设置为相册选择模式
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          // 先显示上传界面，再处理文件上传
          setShowUpload(true);
          // 处理文件上传和抠图
          await handleFileUpload(e.target.files[0]);
        } catch (error) {
          console.error('选择图片失败:', error);
        }
      }
    };
    input.click();
  };

  // 编辑衣物
  const handleEditClothing = (clothing) => {
    setFormData(clothing);
    setCurrentClothingId(clothing.id);
    setEditMode(true);
    setShowUpload(true);
  };

  // 长按开始
  const handleTouchStart = (item) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressItem(item);
    }, 500);
  };

  // 点击删除图标
  const handleDeleteIconClick = (e, item) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发编辑
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  // 长按结束/取消
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // 不清除 longPressItem，让删除图标保持显示直到用户操作
  };

  // 删除衣物
  const handleDeleteClothing = async () => {
    if (!deletingItem) return;

    try {
      await db.deleteClothing(deletingItem.id);
      // 更新本地数据
      setClothingData((prev) =>
        prev.filter((item) => item.id !== deletingItem.id)
      );
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      setLongPressItem(null);
    } catch (error) {
      console.error('删除失败:', error);
      Toast.fail('删除失败，请重试');
    }
  };

  // 加载更多数据（在过滤后的数据上进行分页）
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const startIndex = nextPage * pageSize;
      const endIndex = startIndex + pageSize;

      // 检查过滤后的数据是否还有更多
      const hasMoreData = filteredData.length > endIndex;
      setPage(nextPage);
      setHasMore(hasMoreData);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, pageSize, filteredData]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const scrollHeight = scrollContainerRef.current.scrollHeight;
      const clientHeight = scrollContainerRef.current.clientHeight;

      // 当滚动到距离底部100px时加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, hasMore, page, pageSize, loadMore]);

  // 当搜索或筛选条件改变时，重置页码
  useEffect(() => {
    setPage(1);
    setHasMore(filteredData.length > pageSize);
  }, [searchQuery, activeCat, selectedTags, filteredData.length, pageSize]);

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F5F5F7] pb-24 relative"
      ref={scrollContainerRef}
    >
      {/* 顶部搜索与分类 */}
      <div className="sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-md z-10 px-4 pt-6 pb-2">
        {/* 标题栏与右上角添加按钮 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">我的衣橱</h1>
          <button
            onClick={() => setShowActionMenu(true)}
            className="bg-gray-800 text-white p-2 rounded-full shadow-md shadow-gray-400/30 hover:bg-gray-700 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索衣服名称、标签、季节..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-2xl py-3 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>
        {/* 横向滑动分类 */}
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCat === cat
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 标签过滤 */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pt-1 pb-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 瀑布流/网格展示区 */}
      <div className="px-4 grid grid-cols-2 gap-4 mt-2">
        {displayData.map((item) => (
          <div
            key={item.id}
            onClick={() => handleEditClothing(item)}
            onMouseDown={() => handleTouchStart(item)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={() => handleTouchStart(item)}
            onTouchEnd={handleTouchEnd}
            className={`bg-white rounded-2xl p-3 shadow-sm relative group overflow-hidden cursor-pointer hover:shadow-md transition-all ${
              longPressItem?.id === item.id ? 'ring-2 ring-red-400' : ''
            }`}
          >
            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-3 overflow-hidden relative">
              <img
                src={item.src}
                alt={item.name}
                className="w-full h-full object-cover mix-blend-multiply"
              />
              {/* 删除和取消按钮 */}
              {longPressItem?.id === item.id && (
                <div className="absolute top-2 left-2 flex space-x-2">
                  <div
                    onClick={(e) => handleDeleteIconClick(e, item)}
                    className="bg-red-500 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setLongPressItem(null);
                    }}
                    className="bg-gray-500 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </div>
                </div>
              )}
              {/* 图片上的标签展示 */}
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/80 backdrop-blur-md text-[10px] text-gray-600 px-1.5 py-0.5 rounded-md shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {item.name}
            </h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                穿过 {item.timesWorn} 次
              </span>
              <span className="text-xs text-gray-400">{item.season}</span>
            </div>
          </div>
        ))}
        {/* 列表为空时的提示 */}
        {filteredData.length === 0 && (
          <div className="col-span-2 py-10 text-center text-gray-400 text-sm">
            没有找到匹配的衣物哦 ~
          </div>
        )}

        {/* 加载更多提示 */}
        {filteredData.length > 0 && (
          <div className="col-span-2 flex justify-center items-center py-8">
            {loadingMore ? (
              <div className="text-gray-500 text-sm">加载中...</div>
            ) : hasMore ? (
              <div className="text-gray-500 text-sm">下拉加载更多</div>
            ) : (
              <div className="text-gray-400 text-sm">已显示全部</div>
            )}
          </div>
        )}
      </div>

      {/* 1. 弹出操作菜单 (Action Sheet) */}
      {showActionMenu &&
        createPortal(
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-999 animate-fade-in"
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
              onClick={() => setShowActionMenu(false)}
            />
            {/* 底部抽屉 */}
            <div
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 z-1000 animate-slide-up pb-12 max-w-md mx-auto"
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
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">添加衣物</h3>
              <div className="space-y-3">
                <button
                  onClick={handleTakePhoto}
                  className="w-full flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Camera className="text-gray-600 mr-4" size={24} />
                  <span className="text-gray-800 font-medium">拍照录入</span>
                </button>
                <button
                  onClick={handlePickFromGallery}
                  className="w-full flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <ImageIcon className="text-gray-600 mr-4" size={24} />
                  <span className="text-gray-800 font-medium">从相册选择</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* 2. 录入/编辑单品全屏界面 (Upload/Edit Form) */}
      {showUpload && (
        <div className="fixed inset-0 bg-[#F5F5F7] z-50 flex flex-col animate-fade-in overflow-hidden max-w-md mx-auto">
          {/* 顶部导航 */}
          <div className="flex justify-between items-center p-4 sticky top-0 z-10">
            <button
              onClick={() => {
                setShowUpload(false);
                setEditMode(false);
                setCurrentClothingId(null);
              }}
              className="p-2 bg-white rounded-full shadow-sm active:scale-95"
            >
              <X size={20} className="text-gray-800" />
            </button>
            <span className="font-bold text-gray-800">
              {editMode ? '编辑单品信息' : '添加单品信息'}
            </span>
            <button
              onClick={async () => {
                try {
                  if (editMode) {
                    // 编辑模式：更新现有衣物
                    await db.updateClothing(currentClothingId, formData);
                  } else {
                    // 新增模式：添加新衣物，创建不包含id字段的新对象
                    const newClothing = { ...formData };
                    delete newClothing.id;
                    await db.addClothing(newClothing);
                  }
                  // 重新加载数据
                  const updatedData = await db.getAllClothing();
                  setClothingData(updatedData);
                  // 重置分页状态，确保用户能看到最新添加或编辑的衣服
                  setPage(1);
                  setHasMore(updatedData.length > pageSize);
                  // 关闭上传界面
                  setShowUpload(false);
                  // 重置表单数据和编辑状态
                  setFormData({
                    name: '',
                    type: 'top',
                    season: '夏',
                    tags: [],
                    src: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&q=80',
                    timesWorn: 0,
                  });
                  setEditMode(false);
                  setCurrentClothingId(null);
                  // 重置新标签输入状态
                  setShowNewTagInput(false);
                  setNewTagName('');
                  // 重置抠图状态
                  setIsRemovingBg(false);
                  setBgRemoved(false);
                } catch (error) {
                  console.error('保存失败:', error);
                }
              }}
              className="p-2 bg-gray-800 text-white rounded-full shadow-sm active:scale-95"
            >
              <Save size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 图片预览与抠图提示 */}
            <div className="px-6 py-6 flex justify-center relative">
              <div className="w-56 h-56 bg-gray-200/50 rounded-3xl p-4 relative shadow-inner border border-gray-100 flex items-center justify-center">
                {/* 显示上传的图片 */}
                <img
                  src={formData.src}
                  alt="New Item"
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-md"
                />
                {/* 抠图加载效果 */}
                {isRemovingBg && (
                  <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                    <div className="text-white flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-sm">正在自动抠图...</span>
                    </div>
                  </div>
                )}
                {bgRemoved && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap shadow-md">
                    <Sparkles size={12} className="mr-1 text-yellow-300" /> AI
                    已自动去背景
                  </div>
                )}
              </div>
            </div>

            {/* 表单面板 */}
            <div className="bg-white mx-0 mt-4 rounded-t-[40px] p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] flex flex-col space-y-7 pb-24">
              {/* 名称输入 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">
                  单品名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="输入单品名称"
                  className="w-full text-xl font-bold text-gray-800 border-b-2 border-gray-100 pb-2 focus:outline-none focus:border-gray-800 bg-transparent transition-colors"
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                  分类
                </label>
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                  {['上装', '下装', '外套', '鞋靴', '配饰', '套装'].map(
                    (cat) => {
                      const type = CAT_MAP[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                            formData.type === type
                              ? 'bg-gray-800 text-white shadow-md'
                              : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 季节选择 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                  适合季节
                </label>
                <div className="flex space-x-2">
                  {['春', '夏', '秋', '冬'].map((season) => (
                    <button
                      key={season}
                      onClick={() => setFormData({ ...formData, season })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.season === season
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标签管理 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                  个性标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    // 判断是否为默认标签（默认标签来自 AVAILABLE_TAGS）
                    const isDefaultTag = AVAILABLE_TAGS.includes(tag);

                    return (
                      <div key={tag} className="relative">
                        <button
                          onClick={() => {
                            let newTags;
                            if (formData.tags.includes(tag)) {
                              newTags = formData.tags.filter((t) => t !== tag);
                            } else {
                              newTags = [...formData.tags, tag];
                            }
                            setFormData({ ...formData, tags: newTags });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-gray-800 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                        {/* 非默认标签显示删除按钮 */}
                        {!isDefaultTag && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡，避免触发标签选择
                              // 从可用标签列表中删除
                              setAvailableTags(
                                availableTags.filter((t) => t !== tag)
                              );
                              // 从当前表单标签中删除
                              if (formData.tags.includes(tag)) {
                                setFormData({
                                  ...formData,
                                  tags: formData.tags.filter((t) => t !== tag),
                                });
                              }
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="删除标签"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {showNewTagInput ? (
                    <div
                      className="flex items-center gap-2"
                      ref={newTagInputContainerRef}
                    >
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newTagName.trim()) {
                            const trimmedTag = newTagName.trim();
                            // 检查标签是否已存在
                            if (!availableTags.includes(trimmedTag)) {
                              setAvailableTags([...availableTags, trimmedTag]);
                            }
                            setFormData({
                              ...formData,
                              tags: [...formData.tags, trimmedTag],
                            });
                            setNewTagName('');
                            setShowNewTagInput(false);
                          }
                        }}
                        placeholder="输入标签名称"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (newTagName.trim()) {
                            const trimmedTag = newTagName.trim();
                            // 检查标签是否已存在
                            if (!availableTags.includes(trimmedTag)) {
                              setAvailableTags([...availableTags, trimmedTag]);
                            }
                            setFormData({
                              ...formData,
                              tags: [...formData.tags, trimmedTag],
                            });
                            setNewTagName('');
                            setShowNewTagInput(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setShowNewTagInput(false);
                          setNewTagName('');
                        }}
                        className="px-2 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowNewTagInput(true);
                        // 延迟执行滚动，确保输入框已渲染
                        setTimeout(() => {
                          if (newTagInputContainerRef.current) {
                            newTagInputContainerRef.current.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                          }
                        }, 100);
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-500 border border-dashed border-gray-300 flex items-center hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                      <Plus size={14} className="mr-1" /> 新标签
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认抽屉 */}
      {showDeleteConfirm &&
        deletingItem &&
        createPortal(
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-999 animate-fade-in"
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
                setLongPressItem(null);
              }}
            />
            {/* 确认抽屉 */}
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
                      setLongPressItem(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDeleteClothing}
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
    </div>
  );
};

export default Wardrobe;
