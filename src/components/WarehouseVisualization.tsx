import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Select, Space, Tabs, Menu, Dropdown, Avatar, Button, message } from 'antd';
import WarehouseMap from './WarehouseMap';
import Shelves from './Shelves';
import ItemsDetail from './ItemsDetail';
import Search, { SearchResultInfo } from './Search';
import { fetchWarehouseList, refreshItemsData, fetchWarehouseMap } from '../services/api';
import { AppstoreOutlined, SearchOutlined, DatabaseOutlined, UserOutlined, LogoutOutlined, SyncOutlined, FullscreenOutlined, FullscreenExitOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface WarehouseOption {
  id: string;
  name: string;
}

// 错误边界组件
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('组件渲染错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const WarehouseVisualization: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'warehouse' | 'shelf'>('warehouse');
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('warehouse1');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [searchResult, setSearchResult] = useState<SearchResultInfo | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [warehouseMapKey, setWarehouseMapKey] = useState<number>(0);
  const [shelvesKey, setShelvesKey] = useState<number>(0);
  const [warehouseData, setWarehouseData] = useState<any>(null);
  const [mapError, setMapError] = useState<boolean>(false);
  const [shelvesError, setShelvesError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 获取仓库列表
  useEffect(() => {
    const loadWarehouseOptions = async () => {
      try {
        const warehouses = await fetchWarehouseList();
        setWarehouseOptions(warehouses);
        if (warehouses.length > 0) {
          setSelectedWarehouseId(warehouses[0].id);
        }
      } catch (error) {
        console.error('加载仓库列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWarehouseOptions();
  }, []);

  // 预加载仓库数据
  useEffect(() => {
    const loadWarehouseData = async () => {
      try {
        if (selectedWarehouseId) {
          console.log('预加载仓库数据:', selectedWarehouseId);
          const data = await fetchWarehouseMap(selectedWarehouseId);
          setWarehouseData(data);
          setMapError(false);
        }
      } catch (error) {
        console.error('预加载仓库数据失败:', error);
        setMapError(true);
      }
    };

    loadWarehouseData();
  }, [selectedWarehouseId, refreshKey]);

  const handleShelfClick = (shelfId: string) => {
    console.log('货架点击:', shelfId);

    // 先重置相关状态
    setSelectedLayerId(null);
    setSelectedPositionId(null);
    setShelvesError(false);
    setShelvesKey(prev => prev + 1);

    // 异步设置新的货架ID和视图模式，确保DOM有时间完成更新
    setTimeout(() => {
      setSelectedShelfId(shelfId);
      setViewMode('shelf');
    }, 0);
  };

  const handlePositionClick = (layerId: string, positionId: string) => {
    console.log('库位点击:', layerId, positionId);
    // 使用函数式更新防止批量更新导致的渲染问题
    setSelectedLayerId(prevLayerId => {
      // 只有在值真正变化时才更新
      if (prevLayerId !== layerId) {
        return layerId;
      }
      return prevLayerId;
    });

    setSelectedPositionId(prevPositionId => {
      // 只有在值真正变化时才更新
      if (prevPositionId !== positionId) {
        return positionId;
      }
      return prevPositionId;
    });
  };

  const handleBackToWarehouse = () => {
    console.log('返回仓库视图');

    // 完全重置所有相关状态
    setSelectedLayerId(null);
    setSelectedPositionId(null);
    setShelvesError(false);

    // 使用setTimeout确保状态更新在视图模式切换前完成
    setTimeout(() => {
      setViewMode('warehouse');
      // 强制刷新地图
      const newKey = Date.now();
      setWarehouseMapKey(newKey);
      setRefreshKey(newKey);

      // 重新加载数据
      fetchWarehouseMap(selectedWarehouseId).then(data => {
        setWarehouseData(data);
        console.log('返回仓库视图：已重新加载仓库数据');
      }).catch(e => {
        console.error('返回仓库视图：重新加载仓库数据失败:', e);
        setMapError(true);
      });
    }, 0);
  };

  const handleWarehouseChange = (warehouseId: string) => {
    console.log('切换仓库:', warehouseId);
    setSelectedWarehouseId(warehouseId);
    setSelectedShelfId(null);
    setSelectedLayerId(null);
    setSelectedPositionId(null);
    setViewMode('warehouse');
    setMapError(false);
    setShelvesError(false);
    setWarehouseMapKey(prev => prev + 1);
  };

  const handleNavChange = async (key: string) => {
    setActiveTab(key);

    // 如果切换到地图标签
    if (key === 'map') {
      // 显示加载状态
      setRefreshing(true);

      try {
        console.log('导航栏：刷新仓库数据并切换到地图视图');

        // 先完全重置所有状态
        setSelectedWarehouseId('warehouse1');
        setSelectedShelfId(null);
        setSelectedLayerId(null);
        setSelectedPositionId(null);
        setViewMode('warehouse');
        setShelvesError(false);
        setMapError(false);
        setSearchResult(null);

        // 调用刷新数据API
        const success = await refreshItemsData();

        if (success) {
          message.success('数据刷新成功');

          // 使用新的key触发组件重新渲染
          const newKey = Date.now();
          setRefreshKey(newKey);
          setWarehouseMapKey(newKey);
          setShelvesKey(newKey);

          // 重新加载仓库数据
          try {
            const data = await fetchWarehouseMap('warehouse1');
            setWarehouseData(data);
            console.log('导航栏：已重新加载仓库数据');
          } catch (e) {
            console.error('导航栏：重新加载仓库数据失败', e);
            setMapError(true);
          }
        } else {
          message.error('数据刷新失败');
        }
      } catch (error) {
        console.error('导航栏：刷新数据出错', error);
        message.error('刷新数据时发生错误');
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleSearchResult = (result: SearchResultInfo) => {
    console.log('WarehouseVisualization 接收到搜索结果:', result);

    // 如果搜索结果中包含仓库名称，更新选中的仓库ID
    if (result.found && result.warehouseId) {
      if (result.warehouseId === '公物仓一' || result.warehouseId === '公物仓二') {
        console.log('设置仓库名称:', result.warehouseId);
      }
    }

    setSearchResult(result);
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  // 处理刷新按钮点击 - 此功能已合并到导航栏"仓库地图"按钮中，但保留供其他地方可能调用
  const handleRefresh = async () => {
    console.log('开始刷新数据');
    setRefreshing(true);
    try {
      const success = await refreshItemsData();
      if (success) {
        message.success('数据刷新成功');
        // 使用新的key触发组件重新渲染
        const newRefreshKey = Date.now();
        setRefreshKey(newRefreshKey);
        setWarehouseMapKey(newRefreshKey);
        setShelvesKey(newRefreshKey);
        console.log('设置新的刷新键:', newRefreshKey);

        // 重新加载仓库数据
        try {
          const data = await fetchWarehouseMap(selectedWarehouseId);
          setWarehouseData(data);
          setMapError(false);
        } catch (e) {
          console.error('刷新后重新加载仓库数据失败:', e);
          setMapError(true);
        }
      } else {
        message.error('数据刷新失败');
      }
    } catch (error) {
      console.error('刷新数据出错:', error);
      message.error('刷新数据时发生错误');
    } finally {
      setRefreshing(false);
    }
  };

  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        message.error('全屏模式启动失败: ' + err.message);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          message.error('退出全屏模式失败: ' + err.message);
        });
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 添加简单的样式来移除整页的垂直滚动条
  useEffect(() => {
    // 创建简单的样式元素
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* 移除整个页面的垂直滚动条 */
      body {
        overflow-y: hidden;
      }
      
      /* 保留内部容器的滚动功能 */
      .content-container {
        overflow-y: auto;
      }
    `;
    document.head.appendChild(styleElement);

    // 组件卸载时移除样式
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 渲染内容区域
  const renderContent = () => {
    if (activeTab === 'map') {
      return (
        <div className="warehouse-grid">
          <div className="warehouse-map-section">
            {viewMode === 'warehouse' ? (
              <ErrorBoundary
                key={`warehouse-map-boundary-${warehouseMapKey}`}
                fallback={
                  <div className="error-container">
                    <h3>仓库地图加载失败</h3>
                    <p>请尝试刷新数据或重新加载页面</p>
                    <Button onClick={() => {
                      // 完全重置状态并强制重新渲染
                      setMapError(false);
                      const newKey = Date.now();
                      setWarehouseMapKey(newKey);
                      setRefreshKey(newKey);

                      // 重新加载数据
                      fetchWarehouseMap(selectedWarehouseId).then(data => {
                        setWarehouseData(data);
                        console.log('已重新加载仓库数据');
                      }).catch(e => {
                        console.error('重新加载仓库数据失败:', e);
                      });
                    }}>重试</Button>
                  </div>
                }
              >
                {mapError ? (
                  <div className="error-container">
                    <h3>仓库地图加载失败</h3>
                    <p>请尝试刷新数据或重新加载页面</p>
                    <Button onClick={() => {
                      // 完全重置状态并强制重新渲染
                      setMapError(false);
                      const newKey = Date.now();
                      setWarehouseMapKey(newKey);
                      setRefreshKey(newKey);

                      // 重新加载数据
                      fetchWarehouseMap(selectedWarehouseId).then(data => {
                        setWarehouseData(data);
                        console.log('已重新加载仓库数据');
                      }).catch(e => {
                        console.error('重新加载仓库数据失败:', e);
                      });
                    }}>重试</Button>
                  </div>
                ) : (
                  <div key={`warehouse-map-container-${warehouseMapKey}`} className="map-container">
                    <WarehouseMap
                      key={`warehouse-map-${warehouseMapKey}`}
                      warehouseId={selectedWarehouseId}
                      onShelfClick={handleShelfClick}
                      refreshKey={refreshKey}
                      initialData={warehouseData}
                    />
                  </div>
                )}
              </ErrorBoundary>
            ) : (
              <ErrorBoundary
                key={`shelves-boundary-${shelvesKey}`}
                fallback={
                  <div className="error-container">
                    <h3>货架详情加载失败</h3>
                    <p>请点击导航栏"仓库地图"按钮返回</p>
                  </div>
                }
              >
                {shelvesError ? (
                  <div className="error-container">
                    <h3>货架详情加载失败</h3>
                    <p>请点击导航栏"仓库地图"按钮返回</p>
                  </div>
                ) : selectedShelfId ? (
                  <div key={`shelves-container-${shelvesKey}`} className="shelves-container">
                    <Shelves
                      key={`shelves-${shelvesKey}-${selectedShelfId}`}
                      warehouseId={selectedWarehouseId}
                      shelfId={selectedShelfId}
                      onPositionClick={handlePositionClick}
                      onBack={handleBackToWarehouse}
                      refreshKey={refreshKey}
                      onError={() => setShelvesError(true)}
                    />
                  </div>
                ) : (
                  <div className="empty-container">
                    <h3>未选择货架</h3>
                    <p>请在仓库地图中选择一个货架</p>
                    <Button onClick={handleBackToWarehouse}>刷新仓库地图</Button>
                  </div>
                )}
              </ErrorBoundary>
            )}
          </div>
          <div className="warehouse-details-section">
            <ItemsDetail
              warehouseId={selectedWarehouseId}
              selectedShelfId={selectedShelfId}
              selectedLayerId={selectedLayerId}
              selectedPositionId={selectedPositionId}
              searchItem={searchResult?.found ? searchResult.item : undefined}
              locationInfo={searchResult?.locationInfo}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      );
    } else if (activeTab === 'search') {
      return (
        <div className="warehouse-grid search-grid tech-grid" style={{
          width: '100%',
          maxWidth: '100%',
          height: 'calc(100vh - 64px - 20px)', // 减少20px高度，使下方向上移动
          overflow: 'hidden',
          marginBottom: '20px' // 添加下方边距
        }}>
          <div className="warehouse-search-section tech-card" style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            <Search
              warehouseId={selectedWarehouseId}
              onSearchResult={handleSearchResult}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout className="min-h-screen tech-layout">
      <Header className="header-container tech-header">
        <div className="nav-container tech-nav">
          <div className="left-section" style={{ display: 'flex', alignItems: 'center' }}>
            <Menu
              mode="horizontal"
              selectedKeys={[activeTab]}
              onClick={({ key }) => handleNavChange(key)}
              theme="dark"
              className="main-nav tech-menu aligned-menu"
            >
              <Menu.Item key="map" icon={refreshing ? <SyncOutlined spin className="tech-icon" /> : <AppstoreOutlined className="tech-icon" />}>
                {refreshing ? '正在刷新...' : '仓库地图'}
              </Menu.Item>
              <Menu.Item key="search" icon={<SearchOutlined className="tech-icon" />}>
                物品搜索
              </Menu.Item>
            </Menu>
          </div>

          <div className="center-section" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="tech-logo">
              <ShopOutlined className="tech-logo-icon" />
              <Title level={3} className="header-title">公物仓仓储管理系统</Title>
            </div>
          </div>

          <div className="right-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="warehouse-selector tech-selector" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <Space>
                <DatabaseOutlined className="tech-icon-light" />
                <span className="tech-label" style={{ color: '#fff' }}>选择仓库：</span>
                <Select
                  className="tech-select"
                  style={{ width: 150 }}
                  value={selectedWarehouseId}
                  onChange={handleWarehouseChange}
                  loading={loading}
                >
                  {warehouseOptions.map(warehouse => (
                    <Option
                      key={warehouse.id}
                      value={warehouse.id}
                    >{warehouse.name}</Option>
                  ))}
                </Select>
              </Space>
            </div>

            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined style={{ color: '#fff' }} /> : <FullscreenOutlined style={{ color: '#fff' }} />}
              onClick={toggleFullscreen}
              className="fullscreen-btn tech-btn"
              title={isFullscreen ? "退出全屏" : "全屏显示"}
              style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            />

            <div className="user-info">
              <Dropdown menu={{
                items: [
                  {
                    key: '1',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: handleLogout
                  }
                ]
              }} placement="bottomRight">
                <div className="user-avatar-container tech-user" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                  <Avatar
                    className="tech-avatar"
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<UserOutlined />}
                  />
                  <span className="username tech-username" style={{ color: '#fff' }}>{user?.username || '用户'}</span>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>

      <Content className="content-container">
        {renderContent()}
      </Content>
    </Layout>
  );
};

export default WarehouseVisualization; 