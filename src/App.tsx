import React from 'react';
import { ConfigProvider, Spin } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import './styles/warehouse.scss';
import './styles/tech-nav.css';
import './styles/tech-theme.css';
import './styles/tech-background.css';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
            },
          }}
        >
          <div className="App">
            <AppRoutes />
          </div>
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
