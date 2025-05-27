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
  locationInfo?: string; // 添加库位原始信息
}

const ItemsDetail: React.FC<ItemsDetailProps> = ({
  warehouseId,
  selectedShelfId,
  selectedLayerId,
  selectedPositionId,
  searchItem,
  locationInfo
}) => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [warehouseName, setWarehouseName] = useState<string>('');
  const [parsedLocationInfo, setParsedLocationInfo] = useState<{
    warehouse: string;
    shelf: string;
    layer: string;
    position: string;
  }>({ warehouse: '', shelf: '', layer: '', position: '' });

  console.log('ItemsDetail 接收到的参数:', {
    warehouseId,
    selectedShelfId,
    selectedLayerId,
    selectedPositionId,
    searchItem,
    locationInfo
  });

  // 添加调试输出，显示当前状态
  console.log('ItemsDetail 当前状态:', {
    parsedLocationInfo,
    warehouseName,
    items: items.length
  });

  // 解析库位信息
  useEffect(() => {
    console.log('ItemsDetail - 开始解析库位信息:', locationInfo);

    if (locationInfo) {
      try {
        // 解析 "AQ_HJ_001_1_1" 这样的格式
        const parts = locationInfo.split('_');
        console.log('库位信息各部分:', parts);

        if (parts.length >= 5) {
          // 第一部分: 区域代码 (如 "AQ")
          const area = parts[0];
          // 第二部分: 货架类型 (如 "HJ")
          const shelfType = parts[1];
          // 第三部分: 货架编号 (如 "001")
          const shelfNum = parts[2];
          // 第四部分: 层数 (如 "1")
          const layer = parts[3];
          // 第五部分: 库位编号 (如 "1")
          const position = parts[4];

          console.log('解析的库位信息各部分:', {
            area, shelfType, shelfNum, layer, position
          });

          // 根据区域确定仓库名称
          let warehouse = '';
          if (['AQ', 'BQ', 'CQ', 'DQ'].includes(area)) {
            warehouse = '公物仓一';
          } else if (['EQ', 'FQ'].includes(area)) {
            warehouse = '公物仓二';
          } else {
            warehouse = '未知仓库';
          }

          // 构建货架编号: 区域代码的第一个字符 + 货架编号数字
          const areaCode = area.charAt(0); // 取第一个字符，如 "A"

          // 将货架编号从字符串转为数字 (如 "001" -> 1)
          let shelfNumInt = parseInt(shelfNum, 10);
          if (isNaN(shelfNumInt)) {
            shelfNumInt = 1; // 默认为1号货架
          }

          // 货架编号格式: "A1" (不是 "A1货架")
          const shelf = `${areaCode}${shelfNumInt}`;

          // 设置解析后的库位信息
          const parsedInfo = {
            warehouse: warehouse,
            shelf: shelf,
            layer: layer,
            position: position
          };

          console.log('设置解析后的库位信息:', parsedInfo);
          setParsedLocationInfo(parsedInfo);

          // 更新仓库名称，确保在界面上显示
          if (warehouse) {
            setWarehouseName(warehouse);
          }

          console.log('库位信息解析完成');
        } else {
          console.warn('库位信息格式不正确，无法解析:', locationInfo);
        }
      } catch (error) {
        console.error('解析库位信息失败:', error);
      }
    } else {
      console.log('没有库位信息可解析');
    }
  }, [locationInfo]);

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
    console.log('ItemsDetail 处理数据 - searchItem:', searchItem);

    if (searchItem) {
      console.log('使用searchItem设置items:', [searchItem]);
      setItems([searchItem]);
      return;
    }

    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) {
      console.log('缺少位置信息，清空items');
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
        console.log('从API加载的物品数据:', data);
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
    // 调试信息
    console.log('渲染库位信息:', {
      searchItem: searchItem ? true : false,
      locationInfo: locationInfo || 'none',
      parsedLocationInfo,
      warehouseId
    });

    if (searchItem) {
      // 如果有解析好的库位信息，优先使用
      if (parsedLocationInfo.warehouse && parsedLocationInfo.shelf) {
        console.log('使用解析好的库位信息渲染:', parsedLocationInfo);

        return (
          <Descriptions title="库位物品详情" bordered size="small" className="position-info">
            <Descriptions.Item label="所在仓库">{parsedLocationInfo.warehouse}</Descriptions.Item>
            <Descriptions.Item label="货架编号">{parsedLocationInfo.shelf}</Descriptions.Item>
            <Descriptions.Item label="货架层数">第{parsedLocationInfo.layer}层</Descriptions.Item>
            <Descriptions.Item label="库位编号">{parsedLocationInfo.position}号库位</Descriptions.Item>
            <Descriptions.Item label="物品数量">1项</Descriptions.Item>
          </Descriptions>
        );
      }

      // 如果没有解析好的库位信息，尝试从 searchItem 中提取
      console.log('尝试从 searchItem 提取库位信息:', searchItem);

      // 如果 warehouseId 是公物仓一或公物仓二，直接使用
      let displayWarehouseName = warehouseName || '未知仓库';
      if (warehouseId && (warehouseId === '公物仓一' || warehouseId === '公物仓二')) {
        displayWarehouseName = warehouseId;
      }

      // 提取货架编号、层数和库位编号
      let shelfDisplay = searchItem.shelfId || '未知';
      let layerNumber = '1';
      let positionNumber = '1';

      try {
        if (searchItem.layerId && searchItem.layerId.includes('-L')) {
          layerNumber = searchItem.layerId.split('-L')[1];
        }
      } catch (error) {
        console.error('解析层编号出错:', error);
      }

      try {
        if (searchItem.positionId && searchItem.positionId.includes('-P')) {
          positionNumber = searchItem.positionId.split('-P')[1];
        }
      } catch (error) {
        console.error('解析位置编号出错:', error);
      }

      console.log('从 searchItem 提取的库位信息:', {
        warehouse: displayWarehouseName,
        shelf: shelfDisplay,
        layer: layerNumber,
        position: positionNumber
      });

      return (
        <Descriptions title="库位物品详情" bordered size="small" className="position-info">
          <Descriptions.Item label="所在仓库">{displayWarehouseName}</Descriptions.Item>
          <Descriptions.Item label="货架编号">{shelfDisplay}</Descriptions.Item>
          <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
          <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
          <Descriptions.Item label="物品数量">1项</Descriptions.Item>
        </Descriptions>
      );
    }

    if (!selectedShelfId || !selectedLayerId || !selectedPositionId) return null;

    // 处理选中的库位信息
    let layerNumber = '1';
    let positionNumber = '1';

    try {
      if (selectedLayerId && selectedLayerId.includes('-L')) {
        layerNumber = selectedLayerId.split('-L')[1];
      }
    } catch (error) {
      console.error('解析层编号出错:', error);
    }

    try {
      if (selectedPositionId && selectedPositionId.includes('-P')) {
        positionNumber = selectedPositionId.split('-P')[1];
      }
    } catch (error) {
      console.error('解析位置编号出错:', error);
    }

    // 处理货架编号，如果包含"货架"字样，去掉它
    let displayShelfId = selectedShelfId || '';
    if (displayShelfId.includes('货架')) {
      displayShelfId = displayShelfId.replace('货架', '');
    }

    console.log('渲染选中位置信息:', {
      warehouseName,
      displayShelfId,
      layerNumber,
      positionNumber,
      itemsCount: items.length
    });

    return (
      <Descriptions title="库位物品详情" bordered size="small" className="position-info">
        <Descriptions.Item label="所在仓库">{warehouseName || '未知仓库'}</Descriptions.Item>
        <Descriptions.Item label="货架编号">{displayShelfId}</Descriptions.Item>
        <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
        <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
        <Descriptions.Item label="物品数量">{items.length}项</Descriptions.Item>
      </Descriptions>
    );
  };

  const hasContent = searchItem || (selectedShelfId && selectedLayerId && selectedPositionId);

  // 添加表格数据调试
  console.log('即将渲染的物品数据:', items);

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