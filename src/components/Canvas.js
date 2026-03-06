import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo,
  Redo,
  Trash2,
  Save,
  Plus,
  Palette,
  Loader2,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import { CATEGORIES, CAT_MAP } from '../data/data';
import db from '../utils/db';

const Canvas = () => {
  const [canvasItems, setCanvasItems] = useState([]);
  const canvasRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [mouseDownType, setMouseDownType] = useState(null); // 'drag', 'scale', 'rotate'
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const [startItemState, setStartItemState] = useState({});
  const SNAP_ANGLE = 15; // 旋转对齐角度（每15度对齐一次）

  // 撤销/重做相关状态
  const [history, setHistory] = useState([[]]); // 存储画布状态历史
  const [historyIndex, setHistoryIndex] = useState(0); // 当前历史记录索引

  // 衣物数据相关状态
  const [clothingData, setClothingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // 滚动加载相关状态
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
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
        console.error('加载衣物数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pageSize]);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await db.getClothingByPage(nextPage, pageSize);
      setClothingData((prev) => [...prev, ...result.clothes]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, pageSize]);

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
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, hasMore, page, pageSize, loadMore]);

  // 更新历史记录
  const updateHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 添加衣服到画布中央
  const handleAddItem = (item) => {
    // 检查物品是否已经在画布上
    const isItemExists = canvasItems.some(
      (canvasItem) => canvasItem.id === item.id
    );
    if (isItemExists) return;

    const newItem = {
      ...item,
      uniqueId: Date.now(),
      x: 100 + Math.random() * 50, // 初始位置
      y: 100 + Math.random() * 50,
      scale: 1,
      rotation: 0,
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
    setSelectedId(id);
    setStartMousePos({ x: e.clientX, y: e.clientY });

    // 获取当前物品状态
    const item = canvasItems.find((item) => item.uniqueId === id);
    if (item) {
      setStartItemState({ ...item });
    }

    // 根据鼠标位置判断操作类型
    // 这里简化处理，实际项目中可以根据鼠标位置判断是缩放还是旋转
    setMouseDownType('drag');

    // 将被点击的元素置于顶层
    const updatedItems = canvasItems.map((item) =>
      item.uniqueId === id
        ? {
            ...item,
            zIndex: Math.max(...canvasItems.map((i) => i.zIndex), 0) + 1,
          }
        : item
    );
    setCanvasItems(updatedItems);
  };

  const handlePointerMove = (e) => {
    if (!draggingId || !mouseDownType) return;

    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;

    setCanvasItems((items) =>
      items.map((item) => {
        if (item.uniqueId === draggingId) {
          if (mouseDownType === 'drag') {
            // 拖拽移动
            return {
              ...item,
              x: startItemState.x + deltaX,
              y: startItemState.y + deltaY,
            };
          } else if (mouseDownType === 'scale') {
            // 缩放
            const scaleFactor = 1 + deltaY * 0.01;
            return {
              ...item,
              scale: Math.max(
                0.1,
                Math.min(3, startItemState.scale * scaleFactor)
              ),
            };
          } else if (mouseDownType === 'rotate') {
            // 旋转
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            const newRotation = startItemState.rotation + angle;
            // 对齐到最近的固定角度
            const snappedRotation =
              Math.round(newRotation / SNAP_ANGLE) * SNAP_ANGLE;
            return {
              ...item,
              rotation: snappedRotation % 360,
            };
          }
        }
        return item;
      })
    );
  };

  const handlePointerUp = () => {
    // 拖拽结束时更新历史记录
    updateHistory(canvasItems);
    setDraggingId(null);
    setMouseDownType(null);
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
    setSelectedId(null);
    updateHistory([]);
  };

  // 放大图片
  const handleZoomIn = () => {
    if (!selectedId) return;

    const updatedItems = canvasItems.map((item) => {
      if (item.uniqueId === selectedId) {
        return { ...item, scale: item.scale + 0.1 };
      }
      return item;
    });
    setCanvasItems(updatedItems);
    updateHistory(updatedItems);
  };

  // 缩小图片
  const handleZoomOut = () => {
    if (!selectedId) return;

    const updatedItems = canvasItems.map((item) => {
      if (item.uniqueId === selectedId) {
        return { ...item, scale: Math.max(0.5, item.scale - 0.1) };
      }
      return item;
    });
    setCanvasItems(updatedItems);
    updateHistory(updatedItems);
  };

  // 旋转图片
  const handleRotate = () => {
    if (!selectedId) return;

    const updatedItems = canvasItems.map((item) => {
      if (item.uniqueId === selectedId) {
        return { ...item, rotation: (item.rotation + 45) % 360 };
      }
      return item;
    });
    setCanvasItems(updatedItems);
    updateHistory(updatedItems);
  };

  // 删除图片
  const handleDeleteItem = (id) => {
    const updatedItems = canvasItems.filter((item) => item.uniqueId !== id);
    setCanvasItems(updatedItems);
    setSelectedId(null);
    updateHistory(updatedItems);
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
            className={`p-2 rounded-full transition-colors ${historyIndex <= 0 ? 'text-gray-300' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <Undo size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-full transition-colors ${historyIndex >= history.length - 1 ? 'text-gray-300' : 'bg-gray-50 hover:bg-gray-100'}`}
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
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#fafafa',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerDown={(e) => {
          // 点击画布空白区域取消选中
          if (e.target === canvasRef.current) {
            setSelectedId(null);
            setDraggingId(null);
            setMouseDownType(null);
          }
        }}
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
            className="absolute touch-none"
            style={{
              left: item.x,
              top: item.y,
              zIndex: item.zIndex,
              transform: `rotate(${item.rotation}deg)`,
            }}
          >
            <div
              className="relative group cursor-pointer"
              style={{
                transform: `scale(${item.scale})`,
                filter:
                  draggingId === item.uniqueId || selectedId === item.uniqueId
                    ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))'
                    : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(item.uniqueId);
                setDraggingId(item.uniqueId);
                setMouseDownType('drag');
                setStartMousePos({ x: e.clientX, y: e.clientY });
                setStartItemState({ ...item });

                // 将被点击的元素置于顶层
                const updatedItems = canvasItems.map((i) =>
                  i.uniqueId === item.uniqueId
                    ? {
                        ...i,
                        zIndex:
                          Math.max(...canvasItems.map((i) => i.zIndex), 0) + 1,
                      }
                    : i
                );
                setCanvasItems(updatedItems);
              }}
            >
              <img
                src={item.src}
                className="w-32 h-32 object-contain mix-blend-multiply bg-transparent rounded-xl p-0 pointer-events-none"
                alt="item"
              />
              {/* 选中时的控制手柄 */}
              {(draggingId === item.uniqueId ||
                selectedId === item.uniqueId) && (
                <>
                  {/* 虚线框 */}
                  <div className="absolute inset-0 border-2 border-dashed border-gray-800 rounded-xl pointer-events-none"></div>

                  {/* 拖拽移动手柄 (中心) */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 cursor-move flex items-center justify-center"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingId(item.uniqueId);
                      setMouseDownType('drag');
                      setStartMousePos({ x: e.clientX, y: e.clientY });
                      setStartItemState({ ...item });
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* 十字架 - 横线 */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 transform -translate-y-1/2"></div>
                      {/* 十字架 - 竖线 */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 transform -translate-x-1/2"></div>
                    </div>
                  </div>

                  {/* 缩放手柄 (右下角) */}
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center cursor-se-resize border border-gray-300"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingId(item.uniqueId);
                      setMouseDownType('scale');
                      setStartMousePos({ x: e.clientX, y: e.clientY });
                      setStartItemState({ ...item });
                    }}
                  >
                    <ZoomIn size={12} className="text-blue-500" />
                  </div>

                  {/* 旋转手柄 (右上角) */}
                  <div
                    className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center cursor-rotate border border-gray-300"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingId(item.uniqueId);
                      setMouseDownType('rotate');
                      setStartMousePos({ x: e.clientX, y: e.clientY });
                      setStartItemState({ ...item });
                    }}
                  >
                    <RotateCcw size={12} className="text-red-500" />
                  </div>

                  {/* 删除手柄 (左上角) */}
                  <div
                    className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer border border-gray-300"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.uniqueId);
                    }}
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </div>
                </>
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
                setActiveCategory(cat === '全部' ? 'all' : CAT_MAP[cat])
              }
              className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${activeCategory === (cat === '全部' ? 'all' : CAT_MAP[cat]) ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500'}`}
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
                    activeCategory === 'all' || item.type === activeCategory
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
