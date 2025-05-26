import React, { useState } from 'react';
import { Input, Button, message, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { WarehouseItem } from '../types/warehouse';
import ItemsDetail from './ItemsDetail';

// 假设我们扩展API服务来提供全局搜索功能
import { fetchWarehouseList } from '../services/api';

// 搜索结果接口
export interface SearchResultInfo {
  found: boolean;
  item?: WarehouseItem;
  shelfId?: string;
  layerId?: string;
  positionId?: string;
  warehouseId?: string;
}

interface SearchProps {
  warehouseId: string;
  onSearchResult?: (result: SearchResultInfo) => void;
}

const Search: React.FC<SearchProps> = ({ warehouseId, onSearchResult }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResultInfo | null>(null);

  // 模拟搜索API - 实际项目中应该通过API调用实现
  const searchItemBySku = async (sku: string): Promise<SearchResultInfo> => {
    // 这里模拟API调用延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟从所有仓库数据中搜索物品
        // 实际项目中这应该是后端API完成的工作

        // 将SKU转为大写，便于不区分大小写搜索
        const upperSku = sku.toUpperCase();

        // 模拟几个预设的SKU供测试
        const mockItems: Record<string, {
          item: WarehouseItem;
          shelfId: string;
          layerId: string;
          positionId: string;
          warehouseId: string;
        }> = {
          'SKU-电子-101': {
            item: {
              id: 'item-test-1',
              name: '电子物品A',
              shelfId: 'F13',
              layerId: 'F13-L1',
              positionId: 'F13-L1-P1',
              quantity: 12,
              sku: 'SKU-电子-101',
              category: '电子',
              status: 'normal',
              expiryDate: '2024-5-10'
            },
            shelfId: 'F13',
            layerId: 'F13-L1',
            positionId: 'F13-L1-P1',
            warehouseId: 'warehouse2'
          },
          'SKU-办公-201': {
            item: {
              id: 'item-test-2',
              name: '办公物品B',
              shelfId: 'F14',
              layerId: 'F14-L2',
              positionId: 'F14-L2-P1',
              quantity: 8,
              sku: 'SKU-办公-201',
              category: '办公',
              status: 'warning',
              expiryDate: '2024-3-15'
            },
            shelfId: 'F14',
            layerId: 'F14-L2',
            positionId: 'F14-L2-P1',
            warehouseId: 'warehouse2'
          },
          'SKU-工具-301': {
            item: {
              id: 'item-test-3',
              name: '工具物品C',
              shelfId: 'F18A',
              layerId: 'F18A-L3',
              positionId: 'F18A-L3-P2',
              quantity: 5,
              sku: 'SKU-工具-301',
              category: '工具',
              status: 'danger',
              expiryDate: '2024-2-20'
            },
            shelfId: 'F18A',
            layerId: 'F18A-L3',
            positionId: 'F18A-L3-P2',
            warehouseId: 'warehouse2'
          },
          'SKU-包装-401': {
            item: {
              id: 'item-test-4',
              name: '包装物品D',
              shelfId: 'F16B',
              layerId: 'F16B-L1',
              positionId: 'F16B-L1-P3',
              quantity: 15,
              sku: 'SKU-包装-401',
              category: '包装',
              status: 'normal',
              expiryDate: '2024-6-25'
            },
            shelfId: 'F16B',
            layerId: 'F16B-L1',
            positionId: 'F16B-L1-P3',
            warehouseId: 'warehouse2'
          }
        };

        // 检查是否找到物品
        for (const [itemSku, data] of Object.entries(mockItems)) {
          if (itemSku.toUpperCase().includes(upperSku)) {
            resolve({
              found: true,
              item: data.item,
              shelfId: data.shelfId,
              layerId: data.layerId,
              positionId: data.positionId,
              warehouseId: data.warehouseId
            });
            return;
          }
        }

        // 未找到物品
        resolve({ found: false });
      }, 800); // 模拟延迟
    });
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      message.warning('请输入卡片编码');
      return;
    }

    setLoading(true);
    try {
      const result = await searchItemBySku(searchValue.trim());
      setSearchResult(result);

      // 调用父组件的回调函数传递搜索结果
      if (onSearchResult) {
        onSearchResult(result);
      }

      if (!result.found) {
        message.info(`未找到编码为 "${searchValue}" 的物品`);
      } else {
        message.success(`已找到编码为 "${searchValue}" 的物品`);
      }
    } catch (error) {
      console.error('搜索出错:', error);
      message.error('搜索过程中发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="warehouse-search">
      <div className="search-header">
        <Input
          placeholder="请输入卡片编码搜索物品"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: '300px' }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={loading}
          style={{ marginLeft: '10px' }}
        >
          搜索
        </Button>
      </div>

      <div className="search-results" style={{ marginTop: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="搜索中..." />
          </div>
        ) : searchResult ? (
          searchResult.found && searchResult.item ? (
            <ItemsDetail
              warehouseId={searchResult.warehouseId || warehouseId}
              selectedShelfId={searchResult.shelfId || null}
              selectedLayerId={searchResult.layerId || null}
              selectedPositionId={searchResult.positionId || null}
              searchItem={searchResult.item}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              未找到匹配的物品。请尝试其他卡片编码。
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Search;
