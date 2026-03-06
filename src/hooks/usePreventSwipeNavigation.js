/*
 * @Author: 陈豪
 * @Date: 2026-03-06 16:16:41
 * @description: file description
 * @LastEditors: 陈豪
 * @LastEditTime: 2026-03-06 16:20:51
 * @FilePath: \my-app\src\hooks\usePreventSwipeNavigation.js
 */
import { useEffect } from 'react';

const usePreventSwipeNavigation = () => {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isScrolling = false;
    let scrollStartTime = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
      scrollStartTime = Date.now();
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const elapsedTime = Date.now() - scrollStartTime;

      // 如果是水平滑动且时间较短，阻止浏览器默认手势
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > 10 &&
        elapsedTime < 500
      ) {
        isScrolling = true;
        // 尝试阻止边缘手势
        if (window.history && window.history.navigationMode) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      isScrolling = false;
    };

    // 对于iOS Safari和WebView，需要阻止边缘手势
    const handleDeviceMotion = (e) => {
      // 检测设备方向变化
    };

    // 添加事件监听
    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 阻止iOS Safari的边缘返回手势
    const preventBackSwipe = (e) => {
      // 检查是否是滚动区域
      if (e.target.closest('.snap-x') || e.target.closest('.overflow-x-auto')) {
        e.preventDefault();
      }
    };

    document.addEventListener('gesturechange', preventBackSwipe, {
      passive: false,
    });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('gesturechange', preventBackSwipe);
    };
  }, []);
};

export default usePreventSwipeNavigation;
