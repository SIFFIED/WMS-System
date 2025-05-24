import React, { useState, useEffect } from 'react';
import { ConfigProvider, Spin } from 'antd';
import './App.css';
import './styles/warehouse.scss';
import WarehouseVisualization from './components/WarehouseVisualization';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟页面加载完成
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
    <div className="App">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="正在加载仓库系统..." />
          </div>
        ) : (
          <WarehouseVisualization />
        )}
    </div>
    </ConfigProvider>
  );
}

export default App;
