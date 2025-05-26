import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Empty, Descriptions } from 'antd';
import { WarehouseItem } from '../types/warehouse';
import { fetchPositionItems, fetchWarehouseList } from '../services/api';

interface ItemsDetailProps {
  warehouseId: string;
  selectedShelfId: string | null;
  selectedLayerId: string | null;
  selectedPositionId: string | null;
  searchItem?: WarehouseItem;
}

const ItemsDetail: React.FC<ItemsDetailProps> = ({
  warehouseId,
  selectedShelfId,
  selectedLayerId,
  selectedPositionId,
  searchItem
}) => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [warehouseName, setWarehouseName] = useState<string>('');

  useEffect(() => {
    const getWarehouseName = async () => {
      try {
        const warehouses = await fetchWarehouseList();
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (warehouse) {
          setWarehouseName(warehouse.name);
        }
      } catch (error) {
        console.error('获取仓库名称失败:', error);
      }
    };

    getWarehouseName();
  }, [warehouseId]);

  useEffect(() => {
    if (searchItem) {
      setItems([searchItem]);
      return;
    }

    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      setLoading(true);
      try {
        const data = await fetchPositionItems(
          warehouseId,
          selectedShelfId,
          selectedLayerId,
          selectedPositionId
        );
        setItems(data);
      } catch (error) {
        console.error('加载物品数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [warehouseId, selectedShelfId, selectedLayerId, selectedPositionId, searchItem]);

  const getStatusTag = (status?: string) => {
    switch (status) {
      case 'danger':
        return <Tag color="error">待处置</Tag>;
      case 'warning':
        return <Tag color="warning">待检查</Tag>;
      case 'normal':
      default:
        return <Tag color="success">完备</Tag>;
    }
  };

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '卡片编码',
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
      title: '取得日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text: string) => text || '-',
    },
    {
      title: '物资状态',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  const renderPositionInfo = () => {
    if (searchItem) {
      const layerNumber = searchItem.layerId.split('-L')[1];
      const positionNumber = searchItem.positionId.split('-P')[1];

      return (
        <Descriptions title="搜索结果 - 库位信息" bordered size="small" className="position-info">
          <Descriptions.Item label="所在仓库">{warehouseName}</Descriptions.Item>
          <Descriptions.Item label="货架编号">{searchItem.shelfId}</Descriptions.Item>
          <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
          <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
          <Descriptions.Item label="物品数量">1项</Descriptions.Item>
        </Descriptions>
      );
    }

    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) return null;

    const layerNumber = selectedLayerId.split('-L')[1];
    const positionNumber = selectedPositionId.split('-P')[1];

    return (
      <Descriptions title="库位信息" bordered size="small" className="position-info">
        <Descriptions.Item label="所在仓库">{warehouseName}</Descriptions.Item>
        <Descriptions.Item label="货架编号">{selectedShelfId}</Descriptions.Item>
        <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
        <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
        <Descriptions.Item label="物品数量">{items.length}项</Descriptions.Item>
      </Descriptions>
    );
  };

  const hasContent = searchItem || (selectedShelfId && selectedLayerId && selectedPositionId);

  return (
    <Card
      title="库位物品详情"
      className="h-full"
    >
      {hasContent ? (
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
        <Empty description="请选择一个库位或搜索物品查看详情" />
      )}
    </Card>
  );
};

export default ItemsDetail; 