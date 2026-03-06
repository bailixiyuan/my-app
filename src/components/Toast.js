import React, { useState, useEffect, useRef } from 'react';

const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // info, success, fail
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const show = (options) => {
    if (typeof options === 'string') {
      setMessage(options);
      setType('info');
    } else {
      setMessage(options.message);
      setType(options.type || 'info');
    }
    setVisible(true);
  };

  const success = (message) => {
    show({ message, type: 'success' });
  };

  const fail = (message) => {
    show({ message, type: 'fail' });
  };

  // 导出方法
  Toast.show = show;
  Toast.success = success;
  Toast.fail = fail;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'fail':
        return '✗';
      default:
        return 'i';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'fail':
        return 'bg-red-500';
      default:
        return 'bg-gray-700';
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div
        className={`${getBgColor()} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in whitespace-nowrap`}
      >
        <div className="font-bold">{getIcon()}</div>
        <div className="whitespace-nowrap">{message}</div>
      </div>
    </div>
  );
};

export default Toast;
