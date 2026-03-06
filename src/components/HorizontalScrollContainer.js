import React, { useRef, useEffect } from 'react';

const HorizontalScrollContainer = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      isScrolling.current = true;
    };

    const handleTouchMove = (e) => {
      if (!isScrolling.current) return;

      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX.current) * 2;
      container.scrollLeft = scrollLeft.current - walk;

      // 阻止默认行为以防止页面来回弹动
      if (Math.abs(walk) > 5) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isScrolling.current = false;
    };

    // 鼠标事件支持
    const handleMouseDown = (e) => {
      startX.current = e.pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      isScrolling.current = true;
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isScrolling.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 2;
      container.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      isScrolling.current = false;
      container.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      isScrolling.current = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ cursor: 'grab' }}>
      {children}
    </div>
  );
};

export default HorizontalScrollContainer;
