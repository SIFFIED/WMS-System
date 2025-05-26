import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WarehouseVisualization from '../components/WarehouseVisualization';

const Home: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // 如果用户未认证且加载完成，则重定向到登录页
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  return <WarehouseVisualization />;
};

export default Home; 