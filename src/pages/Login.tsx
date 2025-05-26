import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Login: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentForm, setCurrentForm] = useState<string>('login');

  // 如果用户已认证，则重定向到主页
  if (isAuthenticated && !loading) {
    return <Navigate to="/home" replace />;
  }

  // 处理表单切换
  const handleFormChange = (formType: string) => {
    setCurrentForm(formType);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: '12px 0' }}>
            仓储管理可视化系统
          </Title>
          <div style={{ color: '#666', fontSize: 14 }}>
            登录系统管理您的仓库和物品
          </div>
        </div>

        <LoginForm to={handleFormChange} />
      </Card>
    </div>
  );
};

export default Login; 