import React, { useState, useEffect } from 'react';
import { Layout, Typography, Select, Space, Tabs, Menu } from 'antd';
import WarehouseMap from './WarehouseMap';
import Shelves from './Shelves';
import ItemsDetail from './ItemsDetail';
import Search, { SearchResultInfo } from './Search';
import { fetchWarehouseList } from '../services/api';
import { AppstoreOutlined, SearchOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface WarehouseOption {
  id: string;
  name: string;
}

const WarehouseVisualization: React.FC = () => {
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'warehouse' | 'shelf'>('warehouse');
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('warehouse1');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [searchResult, setSearchResult] = useState<SearchResultInfo | null>(null);

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

  const handleShelfClick = (shelfId: string) => {
    setSelectedShelfId(shelfId);
    setSelectedLayerId(null);
    setSelectedPositionId(null);
    setViewMode('shelf');
  };

  const handlePositionClick = (layerId: string, positionId: string) => {
    setSelectedLayerId(layerId);
    setSelectedPositionId(positionId);
  };

  const handleBackToWarehouse = () => {
    setViewMode('warehouse');
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setSelectedShelfId(null);
    setSelectedLayerId(null);
    setSelectedPositionId(null);
    setViewMode('warehouse');
  };

  const handleNavChange = (key: string) => {
    setActiveTab(key);

    // 如果切换到地图标签，并且有搜索结果
    if (key === 'map' && searchResult) {
      if (searchResult.found && searchResult.shelfId) {
        // 如果找到物品，跳转到物品所在货架
        setSelectedWarehouseId(searchResult.warehouseId || 'warehouse1');
        setSelectedShelfId(searchResult.shelfId);
        setSelectedLayerId(searchResult.layerId || null);
        setSelectedPositionId(searchResult.positionId || null);
        setViewMode('shelf');
      } else {
        // 如果物品不存在，跳转到默认仓库页面
        setSelectedWarehouseId('warehouse1');
        setSelectedShelfId(null);
        setSelectedLayerId(null);
        setSelectedPositionId(null);
        setViewMode('warehouse');
      }
    }
  };

  const handleSearchResult = (result: SearchResultInfo) => {
    setSearchResult(result);
  };

  // 渲染内容区域
  const renderContent = () => {
    if (activeTab === 'map') {
      return (
        <div className="warehouse-grid">
          <div className="warehouse-map-section">
            {viewMode === 'warehouse' ? (
              <WarehouseMap
                warehouseId={selectedWarehouseId}
                onShelfClick={handleShelfClick}
              />
            ) : (
              <Shelves
                warehouseId={selectedWarehouseId}
                shelfId={selectedShelfId!}
                onPositionClick={handlePositionClick}
                onBack={handleBackToWarehouse}
              />
            )}
          </div>
          <div className="warehouse-details-section">
            <ItemsDetail
              warehouseId={selectedWarehouseId}
              selectedShelfId={selectedShelfId}
              selectedLayerId={selectedLayerId}
              selectedPositionId={selectedPositionId}
              searchItem={searchResult?.found ? searchResult.item : undefined}
            />
          </div>
        </div>
      );
    } else if (activeTab === 'search') {
      return (
        <div className="warehouse-grid search-grid">
          <div className="warehouse-search-section">
            <Search warehouseId={selectedWarehouseId} onSearchResult={handleSearchResult} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout className="min-h-screen">
      <Header className="header-container">
        <div className="nav-container">
          <div className="logo-title">
            <Title level={3} className="header-title">仓储管理可视化系统</Title>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            onClick={({ key }) => handleNavChange(key)}
            theme="dark"
            className="main-nav"
          >
            <Menu.Item key="map" icon={<AppstoreOutlined />}>
              仓库地图
            </Menu.Item>
            <Menu.Item key="search" icon={<SearchOutlined />}>
              物品搜索
            </Menu.Item>
          </Menu>

          <div className="warehouse-selector">
            <Space>
              <DatabaseOutlined style={{ color: 'white', fontSize: '16px' }} />
              <span style={{ color: 'white' }}>选择仓库：</span>
              <Select
                style={{ width: 150 }}
                value={selectedWarehouseId}
                onChange={handleWarehouseChange}
                loading={loading}
              >
                {warehouseOptions.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Option>
                ))}
              </Select>
            </Space>
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