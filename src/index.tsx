import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss'; // 引入样式表

// 仓库可视化系统 - 基于React和D3.js
// 该系统展示了仓库平面图，并允许用户查看货架内层和库位详情

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

