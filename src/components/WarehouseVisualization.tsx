import React, { useState } from 'react';
import { Layout, Typography } from 'antd';
import WarehouseMap from './WarehouseMap';
import Shelves from './Shelves';
import ItemsDetail from './ItemsDetail';

const { Header, Content } = Layout;
const { Title } = Typography;

const WarehouseVisualization: React.FC = () => {
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'warehouse' | 'shelf'>('warehouse');

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

  return (
    <Layout className="min-h-screen">
      <Header className="header-container">
        <Title level={3} className="header-title">仓储管理可视化系统</Title>
      </Header>
      <Content className="content-container">
        <div className="warehouse-grid">
          <div className="warehouse-map-section">
            {viewMode === 'warehouse' ? (
              <WarehouseMap onShelfClick={handleShelfClick} />
            ) : (
              <Shelves
                shelfId={selectedShelfId!}
                onPositionClick={handlePositionClick}
                onBack={handleBackToWarehouse}
              />
            )}
          </div>
          <div className="warehouse-details-section">
            <ItemsDetail
              selectedShelfId={selectedShelfId}
              selectedLayerId={selectedLayerId}
              selectedPositionId={selectedPositionId}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default WarehouseVisualization; 