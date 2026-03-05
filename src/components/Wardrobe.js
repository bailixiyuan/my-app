import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Info,
  Check,
  Save,
} from "lucide-react";
import { AVAILABLE_TAGS, CAT_MAP, CATEGORIES } from "../data/data";
import db from "../utils/db";

const Wardrobe = () => {
  const [activeCat, setActiveCat] = useState("全部");
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTags, setUploadTags] = useState(["复古", "印花"]);
  const [clothingData, setClothingData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 分页相关状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 表单数据
  const [formData, setFormData] = useState({
    name: "复古印花短袖衬衫",
    type: "top",
    season: "夏",
    tags: ["复古", "印花"],
    src: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&q=80",
    timesWorn: 0,
  });

  // 编辑模式状态
  const [editMode, setEditMode] = useState(false);
  const [currentClothingId, setCurrentClothingId] = useState(null);

  // 文件输入引用
  const fileInputRef = useRef(null);
  // 滚动容器引用
  const scrollContainerRef = useRef(null);

  // 初始化数据库并加载数据
  useEffect(() => {
    // 清空搜索条件和筛选条件
    setActiveCat("全部");
    setSelectedTags([]);
    setSearchQuery("");
    // 重置分页条件
    setPage(1);
    setHasMore(true);

    const loadData = async () => {
      try {
        await db.initDB();
        // 加载所有数据用于搜索和筛选
        const allData = await db.getAllClothing();
        setClothingData(allData);
        // 根据分页设置显示的数据
        const displayData = allData.slice(0, pageSize);
        setHasMore(allData.length > pageSize);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 实现分类、标签和搜索的多重过滤
  const filteredData = clothingData.filter((item) => {
    // 分类筛选：当选择"全部"时显示所有，否则匹配对应类型
    const matchCat = activeCat === "全部" || item.type === CAT_MAP[activeCat];

    // 标签筛选：多选模式，选中多个标签时要求同时满足
    const matchTag =
      selectedTags.length === 0 ||
      (item.tags && selectedTags.every((tag) => item.tags.includes(tag)));

    // 搜索功能：匹配名称、标签、季节（不区分大小写）
    const searchLower = searchQuery.toLowerCase().trim();
    const matchSearch =
      searchQuery.trim() === "" ||
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setFormData({ ...formData, src: imageUrl });
        resolve(imageUrl);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  // 拍照录入
  const handleTakePhoto = () => {
    setShowActionMenu(false);
    // 创建一个文件输入元素，设置为拍照模式
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "camera";
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          await handleFileUpload(e.target.files[0]);
          setShowUpload(true);
        } catch (error) {
          console.error("拍照失败:", error);
        }
      }
    };
    input.click();
  };

  // 从相册选择
  const handlePickFromGallery = () => {
    setShowActionMenu(false);
    // 创建一个文件输入元素，设置为相册选择模式
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          await handleFileUpload(e.target.files[0]);
          setShowUpload(true);
        } catch (error) {
          console.error("选择图片失败:", error);
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

  // 加载更多数据（在过滤后的数据上进行分页）
  const loadMore = () => {
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
      console.error("加载更多数据失败:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [loadingMore, hasMore, page, pageSize]);

  // 当搜索或筛选条件改变时，重置页码
  useEffect(() => {
    setPage(1);
    setHasMore(filteredData.length > pageSize);
  }, [searchQuery, activeCat, selectedTags]);

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
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-100"
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
                    : [...prev, tag],
                )
              }
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                selectedTags.includes(tag)
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
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
            className="bg-white rounded-2xl p-3 shadow-sm relative group overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-3 overflow-hidden relative">
              <img
                src={item.src}
                alt={item.name}
                className="w-full h-full object-cover mix-blend-multiply"
              />
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
      {showActionMenu && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/40 z-30 animate-fade-in"
            onClick={() => setShowActionMenu(false)}
          />
          {/* 底部抽屉 */}
          <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 z-40 animate-slide-up pb-safe max-w-md mx-auto">
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
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  setShowUpload(true);
                }}
                className="w-full flex items-center p-4 bg-gray-800 rounded-2xl text-white shadow-md hover:bg-gray-700 transition-colors"
              >
                <Sparkles className="text-yellow-300 mr-4" size={24} />
                <span className="font-medium">AI 批量识别导入</span>
              </button>
            </div>
          </div>
        </>
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
              {editMode ? "编辑单品信息" : "添加单品信息"}
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
                    name: "复古印花短袖衬衫",
                    type: "top",
                    season: "夏",
                    tags: ["复古", "印花"],
                    src: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&q=80",
                    timesWorn: 0,
                  });
                  setEditMode(false);
                  setCurrentClothingId(null);
                } catch (error) {
                  console.error("保存失败:", error);
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
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap shadow-md">
                  <Sparkles size={12} className="mr-1 text-yellow-300" /> AI
                  已自动去背景
                </div>
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
                  className="w-full text-xl font-bold text-gray-800 border-b-2 border-gray-100 pb-2 focus:outline-none focus:border-gray-800 bg-transparent transition-colors"
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                  自动识别分类
                </label>
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                  {["上装", "下装", "外套", "鞋靴", "配饰"].map((cat) => {
                    const type = CAT_MAP[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                          formData.type === type
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 季节选择 */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                  适合季节
                </label>
                <div className="flex space-x-2">
                  {["春", "夏", "秋", "冬"].map((season) => (
                    <button
                      key={season}
                      onClick={() => setFormData({ ...formData, season })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.season === season
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
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
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
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
                          ? "bg-gray-800 text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-500 border border-dashed border-gray-300 flex items-center hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    <Plus size={14} className="mr-1" /> 新标签
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
