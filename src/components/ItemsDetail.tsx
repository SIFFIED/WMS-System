import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Empty, Descriptions } from 'antd';
import { WarehouseItem } from '../types/warehouse';

interface ItemsDetailProps {
  selectedShelfId: string | null;
  selectedLayerId: string | null;
  selectedPositionId: string | null;
}

// 模拟物品数据生成函数
const generateMockItems = (shelfId: string | null, layerId: string | null, positionId: string | null): WarehouseItem[] => {
  if (!shelfId || !layerId || !positionId) return [];

  const itemCount = Math.floor(Math.random() * 4); // 0-3个物品
  const items: WarehouseItem[] = [];

  const categories = ['电子', '办公', '工具', '包装', '食品', '服装', '电器'];
  const statuses = ['normal', 'warning', 'danger'] as const;

  for (let i = 0; i < itemCount; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    items.push({
      id: `item-${shelfId}-${layerId}-${positionId}-${i}`,
      name: `${randomCategory}物品${String.fromCharCode(65 + i)}`,
      shelfId,
      layerId,
      positionId,
      quantity: Math.floor(Math.random() * 20) + 1,
      sku: `SKU-${randomCategory}-${Math.floor(Math.random() * 1000)}`,
      category: randomCategory,
      status: randomStatus,
      expiryDate: Math.random() > 0.5 ? `2024-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}` : undefined
    });
  }

  return items;
};

const ItemsDetail: React.FC<ItemsDetailProps> = ({
  selectedShelfId,
  selectedLayerId,
  selectedPositionId
}) => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      setLoading(true);
      try {
        // 使用生成的模拟数据
        const data = generateMockItems(selectedShelfId, selectedLayerId, selectedPositionId);
        setItems(data);
      } catch (error) {
        console.error('加载物品数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [selectedShelfId, selectedLayerId, selectedPositionId]);

  const getStatusTag = (status?: string) => {
    switch (status) {
      case 'danger':
        return <Tag color="error">异常</Tag>;
      case 'warning':
        return <Tag color="warning">警告</Tag>;
      case 'normal':
      default:
        return <Tag color="success">正常</Tag>;
    }
  };

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU编码',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => text ? <Tag>{text}</Tag> : '-',
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  // 渲染位置信息
  const renderPositionInfo = () => {
    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) return null;

    const layerNumber = selectedLayerId.split('-L')[1];
    const positionNumber = selectedPositionId.split('-P')[1];

    return (
      <Descriptions title="库位信息" bordered size="small" className="position-info">
        <Descriptions.Item label="货架编号">{selectedShelfId}</Descriptions.Item>
        <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
        <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
        <Descriptions.Item label="物品数量">{items.length}项</Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <Card
      title="库位物品详情"
      className="h-full"
    >
      {selectedShelfId && selectedLayerId && selectedPositionId ? (
        <>
          {renderPositionInfo()}
          <div className="position-items">
            <Table
              rowKey="id"
              dataSource={items}
              columns={columns}
              loading={loading}
              pagination={false}
              locale={{ emptyText: <Empty description="此库位暂无物品" /> }}
            />
          </div>
        </>
      ) : (
        <Empty description="请选择一个库位查看物品详情" />
      )}
    </Card>
  );
};

export default ItemsDetail; 