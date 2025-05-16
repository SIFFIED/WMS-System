import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 仓库可视化系统 - 基于React和D3.js
// 该系统展示了仓库平面图，并允许用户查看货架内层和库位详情

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

