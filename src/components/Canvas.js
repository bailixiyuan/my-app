import React, { useState, useRef, useEffect } from "react";
import { Undo, Redo, Trash2, Save, Plus, Palette, Loader2 } from "lucide-react";
import { CATEGORIES, CAT_MAP } from "../data/data";
import db from "../utils/db";

const Canvas = () => {
  const [canvasItems, setCanvasItems] = useState([]);
  const canvasRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  // 撤销/重做相关状态
  const [history, setHistory] = useState([[]]); // 存储画布状态历史
  const [historyIndex, setHistoryIndex] = useState(0); // 当前历史记录索引

  // 衣物数据相关状态
  const [clothingData, setClothingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // 滚动加载相关状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const wardrobeRef = useRef(null);

  // 加载衣物数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await db.initDB();
        const result = await db.getClothingByPage(1, pageSize);
        setClothingData(result.clothes);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("加载衣物数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 加载更多数据
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await db.getClothingByPage(nextPage, pageSize);
      setClothingData((prev) => [...prev, ...result.clothes]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("加载更多数据失败:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (!wardrobeRef.current) return;

      const container = wardrobeRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // 当滚动到距离右边缘100px时加载更多
      if (scrollWidth - scrollLeft - clientWidth < 100) {
        loadMore();
      }
    };

    const container = wardrobeRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [loadingMore, hasMore, page, pageSize]);

  // 更新历史记录
  const updateHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 添加衣服到画布中央
  const handleAddItem = (item) => {
    const newItem = {
      ...item,
      uniqueId: Date.now(),
      x: 100 + Math.random() * 50, // 初始位置
      y: 100 + Math.random() * 50,
      scale: 1,
      zIndex: canvasItems.length + 1,
    };
    const newItems = [...canvasItems, newItem];
    setCanvasItems(newItems);
    updateHistory(newItems);
  };

  // 极简拖拽逻辑
  const handlePointerDown = (e, id) => {
    e.preventDefault(); // 防止滚动
    setDraggingId(id);

    // 将被点击的元素置于顶层
    const updatedItems = canvasItems.map((item) =>
      item.uniqueId === id
        ? {
            ...item,
            zIndex: Math.max(...canvasItems.map((i) => i.zIndex), 0) + 1,
          }
        : item,
    );
    setCanvasItems(updatedItems);
  };

  const handlePointerMove = (e) => {
    if (!draggingId) return;

    // 简单计算移动 (在真实App中需处理边界和相对于容器的坐标)
    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;

    setCanvasItems((items) =>
      items.map((item) => {
        if (item.uniqueId === draggingId) {
          return { ...item, x: item.x + movementX, y: item.y + movementY };
        }
        return item;
      }),
    );
  };

  const handlePointerUp = () => {
    // 拖拽结束时更新历史记录
    updateHistory(canvasItems);
    setDraggingId(null);
  };

  // 撤销操作
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasItems(history[newIndex]);
    }
  };

  // 重做操作
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasItems(history[newIndex]);
    }
  };

  // 清空画布
  const handleClear = () => {
    setCanvasItems([]);
    updateHistory([]);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white z-10">
        <h1 className="text-xl font-bold text-gray-800">搭配画布</h1>
        <div className="flex space-x-2 text-gray-500">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-full transition-colors ${historyIndex <= 0 ? "text-gray-300" : "bg-gray-50 hover:bg-gray-100"}`}
          >
            <Undo size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-full transition-colors ${historyIndex >= history.length - 1 ? "text-gray-300" : "bg-gray-50 hover:bg-gray-100"}`}
          >
            <Redo size={16} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 bg-gray-50 rounded-full hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button className="p-2 bg-gray-800 text-white rounded-full shadow-sm hover:bg-gray-700 transition-colors">
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* 画布区 (占据剩余空间) */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden touch-none"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundColor: "#fafafa",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {canvasItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <Palette size={48} className="mb-4 opacity-50" />
            <p>从下方衣橱点击拖入衣物开始搭配</p>
          </div>
        )}

        {/* 画布上的物品 */}
        {canvasItems.map((item) => (
          <div
            key={item.uniqueId}
            onPointerDown={(e) => handlePointerDown(e, item.uniqueId)}
            className="absolute cursor-move touch-none"
            style={{
              left: item.x,
              top: item.y,
              zIndex: item.zIndex,
              transform: `scale(${item.scale})`,
              filter:
                draggingId === item.uniqueId
                  ? "drop-shadow(0 10px 15px rgba(0,0,0,0.2))"
                  : "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
            }}
          >
            <div className="relative group">
              <img
                src={item.src}
                className="w-32 h-32 object-contain mix-blend-multiply bg-white rounded-xl p-2 pointer-events-none"
                alt="item"
              />
              {/* 选中时的虚线框 (模拟) */}
              {draggingId === item.uniqueId && (
                <div className="absolute inset-0 border-2 border-dashed border-gray-800 rounded-xl pointer-events-none"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 衣橱抽屉 (固定高度确保完整显示) */}
      <div className="h-60 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl z-20 flex flex-col relative">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-2 mb-2"></div>
        <div className="px-4 py-1 flex space-x-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === "全部" ? "all" : CAT_MAP[cat])
              }
              className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${activeCategory === (cat === "全部" ? "all" : CAT_MAP[cat]) ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div
          ref={wardrobeRef}
          className="flex-1 flex overflow-x-auto px-4 pb-2 pt-1 space-x-3 items-baseline scrollbar-hide"
        >
          {loading ? (
            <div className="flex space-x-3 items-center">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {clothingData
                .filter(
                  (item) =>
                    activeCategory === "all" || item.type === activeCategory,
                )
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100 hover:border-gray-800 transition-colors relative"
                  >
                    <img
                      src={item.src}
                      className="w-full h-full object-contain mix-blend-multiply"
                      alt="thumb"
                    />
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                      <Plus size={8} className="text-gray-800" />
                    </div>
                  </button>
                ))}
              {loadingMore && (
                <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center">
                  <Loader2 size={16} className="text-gray-400 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
