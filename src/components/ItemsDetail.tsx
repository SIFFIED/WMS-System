import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Empty, Descriptions, Typography, Button, message } from 'antd';
import { WarehouseItem } from '../types/warehouse';
import { fetchPositionItems, fetchWarehouseList } from '../services/api';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ItemsDetailProps {
  warehouseId: string;
  selectedShelfId: string | null;
  selectedLayerId: string | null;
  selectedPositionId: string | null;
  searchItem?: WarehouseItem;
  locationInfo?: string; // 添加库位原始信息
  refreshKey?: number; // 添加刷新键
}

const ItemsDetail: React.FC<ItemsDetailProps> = ({
  warehouseId,
  selectedShelfId,
  selectedLayerId,
  selectedPositionId,
  searchItem,
  locationInfo,
  refreshKey
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
    locationInfo,
    refreshKey
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
        console.log('ItemsDetail - 获取仓库名称:', warehouseId);
        const warehouses = await fetchWarehouseList();
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (warehouse) {
          console.log('找到仓库名称:', warehouse.name);
          setWarehouseName(warehouse.name);
        } else {
          console.log('未找到仓库名称, 使用默认值');
        }
      } catch (error) {
        console.error('获取仓库名称失败:', error);
      }
    };

    getWarehouseName();
  }, [warehouseId, refreshKey]);  // 添加refreshKey作为依赖项

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
        console.log('ItemsDetail - 加载物品数据:', {
          warehouseId, selectedShelfId, selectedLayerId, selectedPositionId, refreshKey
        });
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
        setItems([]); // 加载失败时设置为空数组，避免显示旧数据
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [warehouseId, selectedShelfId, selectedLayerId, selectedPositionId, searchItem, refreshKey]); // 添加refreshKey作为依赖项

  // 自定义渐变色标签
  const getStatusTag = (status?: string) => {
    switch (status) {
      case 'danger':
        return (
          <Tag
            style={{
              background: 'linear-gradient(to right, #ff4d4f, #f5222d)',
              border: 'none',
              color: 'white',
              padding: '0 10px',
              borderRadius: '12px'
            }}
          >
            待处置
          </Tag>
        );
      case 'warning':
        return (
          <Tag
            style={{
              background: 'linear-gradient(to right, #faad14, #fa8c16)',
              border: 'none',
              color: 'white',
              padding: '0 10px',
              borderRadius: '12px'
            }}
          >
            待检查
          </Tag>
        );
      case 'normal':
      default:
        return (
          <Tag
            style={{
              background: 'linear-gradient(to right, #52c41a, #389e0d)',
              border: 'none',
              color: 'white',
              padding: '0 10px',
              borderRadius: '12px'
            }}
          >
            完备
          </Tag>
        );
    }
  };

  // 复制文本到剪贴板的函数
  const copyToClipboard = (text: string) => {
    // 使用现代剪贴板API
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success('已复制库位ID到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        message.error('复制失败，请手动复制');

        // 后备方案：创建一个临时文本区域
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (successful) {
            message.success('已复制库位ID到剪贴板');
          } else {
            message.warning('复制可能未成功，请手动复制');
          }
        } catch (e) {
          console.error('后备复制方法也失败:', e);
          message.error('复制失败，请手动复制');
        }
      });
  };

  // 自定义库位ID渲染器
  const renderLocationId = (locationId: string) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#1890ff', fontWeight: 'bold', marginRight: '8px' }}>
          {locationId}
        </span>
        <Button
          type="text"
          icon={<CopyOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // 防止点击事件冒泡
            copyToClipboard(locationId);
          }}
          style={{
            color: '#1890ff',
            padding: '0 4px',
            height: '22px',
            lineHeight: '22px'
          }}
        />
      </div>
    );
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
      render: (text: string) => text ? (
        <Tag
          style={{
            background: 'linear-gradient(to right, #1890ff, #096dd9)',
            border: 'none',
            color: 'white',
            padding: '0 10px',
            borderRadius: '12px'
          }}
        >
          {text}
        </Tag>
      ) : '-',
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
    }
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
          <Descriptions
            bordered
            size="small"
            className="position-info tech-descriptions"
            labelStyle={{
              background: 'linear-gradient(to right, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.05))',
              fontWeight: 'bold',
              padding: '8px 12px',
              borderRight: '1px solid rgba(24, 144, 255, 0.2)'
            }}
            contentStyle={{
              padding: '8px 12px',
              background: 'linear-gradient(to right, rgba(240, 248, 255, 0.6), rgba(240, 248, 255, 0.3))'
            }}
            style={{
              border: '1px solid rgba(24, 144, 255, 0.3)',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Descriptions.Item label="所在仓库">{parsedLocationInfo.warehouse}</Descriptions.Item>
            <Descriptions.Item label="货架编号">{parsedLocationInfo.shelf}</Descriptions.Item>
            <Descriptions.Item label="货架层数">第{parsedLocationInfo.layer}层</Descriptions.Item>
            <Descriptions.Item label="库位编号">{parsedLocationInfo.position}号库位</Descriptions.Item>
            <Descriptions.Item label="物品数量">1项</Descriptions.Item>
            <Descriptions.Item label="库位ID">
              {searchItem.realLocationId ? renderLocationId(searchItem.realLocationId) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="库位编码">
              {searchItem.locationCode || locationInfo || '-'}
            </Descriptions.Item>
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
        <Descriptions
          bordered
          size="small"
          className="position-info tech-descriptions"
          labelStyle={{
            background: 'linear-gradient(to right, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.05))',
            fontWeight: 'bold',
            padding: '8px 12px',
            borderRight: '1px solid rgba(24, 144, 255, 0.2)'
          }}
          contentStyle={{
            padding: '8px 12px',
            background: 'linear-gradient(to right, rgba(240, 248, 255, 0.6), rgba(240, 248, 255, 0.3))'
          }}
          style={{
            border: '1px solid rgba(24, 144, 255, 0.3)',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Descriptions.Item label="所在仓库">{displayWarehouseName}</Descriptions.Item>
          <Descriptions.Item label="货架编号">{shelfDisplay}</Descriptions.Item>
          <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
          <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
          <Descriptions.Item label="物品数量">1项</Descriptions.Item>
          <Descriptions.Item label="库位ID">
            {searchItem.realLocationId ? renderLocationId(searchItem.realLocationId) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="库位编码">
            {searchItem.locationCode || locationInfo || '-'}
          </Descriptions.Item>
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

    // 查找第一个物品，获取库位ID和编码
    const firstItem = items.length > 0 ? items[0] : null;
    const realLocationId = firstItem?.realLocationId || '';
    const locationCode = firstItem?.locationCode || '';

    return (
      <Descriptions
        bordered
        size="small"
        className="position-info tech-descriptions"
        labelStyle={{
          background: 'linear-gradient(to right, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.05))',
          fontWeight: 'bold',
          padding: '8px 12px',
          borderRight: '1px solid rgba(24, 144, 255, 0.2)'
        }}
        contentStyle={{
          padding: '8px 12px',
          background: 'linear-gradient(to right, rgba(240, 248, 255, 0.6), rgba(240, 248, 255, 0.3))'
        }}
        style={{
          border: '1px solid rgba(24, 144, 255, 0.3)',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Descriptions.Item label="所在仓库">{warehouseName || '未知仓库'}</Descriptions.Item>
        <Descriptions.Item label="货架编号">{displayShelfId}</Descriptions.Item>
        <Descriptions.Item label="货架层数">第{layerNumber}层</Descriptions.Item>
        <Descriptions.Item label="库位编号">{positionNumber}号库位</Descriptions.Item>
        <Descriptions.Item label="物品数量">{items.length}项</Descriptions.Item>
        <Descriptions.Item label="库位ID">
          {realLocationId ? renderLocationId(realLocationId) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="库位编码">
          {locationCode || '-'}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const hasContent = searchItem || (selectedShelfId && selectedLayerId && selectedPositionId);

  // 添加表格数据调试
  console.log('即将渲染的物品数据:', items);

  return (
    <div className="warehouse-details-container" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to right, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(24, 144, 255, 0.2)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 添加一个额外的边框层，确保四角完美 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '8px',
        border: '1px solid rgba(24, 144, 255, 0.2)',
        pointerEvents: 'none'
      }} />

      <div className="tech-card-header" style={{
        background: 'linear-gradient(45deg, #1890ff, #096dd9, #0050b3)',
        color: '#ffffff',
        borderBottom: '1px solid rgba(24, 144, 255, 0.5)',
        fontWeight: 'bold',
        fontSize: '16px',
        padding: '12px 16px',
        position: 'relative',
        zIndex: 1
      }}>
        库位物品详情
      </div>
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #f0f8ff, #e6f7ff, #e6f7ff)',
        height: 'calc(100% - 44px)', /* 减去头部高度 */
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        {hasContent ? (
          <>
            <div className="tech-descriptions-container" style={{ marginBottom: '16px' }}>
              {renderPositionInfo()}
            </div>
            <div
              className="position-items tech-table"
              style={{
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.85))',
                borderRadius: '6px',
                padding: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(24, 144, 255, 0.15)',
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                minHeight: '0'
              }}
            >
              <Table
                rowKey="id"
                dataSource={items}
                columns={columns}
                loading={loading}
                pagination={false}
                locale={{ emptyText: <Empty description="此库位暂无物品" /> }}
                className="tech-table-inner"
                style={{ marginTop: '4px' }}
                rowClassName={(record, index) => index % 2 === 0 ? 'item-row-even' : 'item-row-odd'}
                onRow={(record) => ({
                  style: {
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    background: 'transparent'
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                })}
              />
            </div>
          </>
        ) : (
          <div
            className="tech-empty-container"
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(230, 244, 255, 0.6))',
              borderRadius: '6px',
              border: '1px solid rgba(24, 144, 255, 0.15)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Empty
              description={
                <span style={{
                  color: '#666',
                  fontSize: '14px',
                  background: 'linear-gradient(to right, #1890ff, #096dd9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  请选择一个库位或搜索物品查看详情
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsDetail; 