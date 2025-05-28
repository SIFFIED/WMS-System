import React, { useState } from 'react';
import { Input, Button, message, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { WarehouseItem } from '../types/warehouse';
import ItemsDetail from './ItemsDetail';

// 导入auth服务和findLocationByRealId函数
import authService from '../services/api/auth';
import { findLocationByRealId } from '../services/api';

// 搜索结果接口
export interface SearchResultInfo {
  found: boolean;
  item?: WarehouseItem;
  shelfId?: string;
  layerId?: string;
  positionId?: string;
  warehouseId?: string;
  locationInfo?: string;
}

interface SearchProps {
  warehouseId: string;
  onSearchResult?: (result: SearchResultInfo) => void;
}

const Search: React.FC<SearchProps> = ({ warehouseId, onSearchResult }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResultInfo | null>(null);

  // 使用searchCardCode方法搜索物品
  const searchItemByCardCode = async (cardCode: string): Promise<SearchResultInfo> => {
    try {
      console.log('步骤1: 开始搜索卡片编码:', cardCode);

      // 第一步：通过卡片编码搜索方法获取物品信息
      const apiResult = await authService.searchCardCode(cardCode);
      console.log('步骤1: 卡片编码搜索API返回结果:', apiResult);

      // 检查API返回数据的结构
      let dataArray: any[] = [];

      if (apiResult.success) {
        if (Array.isArray(apiResult.data)) {
          dataArray = apiResult.data;
        } else if (apiResult.data && typeof apiResult.data === 'object' && 'items' in apiResult.data && Array.isArray(apiResult.data.items)) {
          dataArray = apiResult.data.items;
        } else if (apiResult.data && typeof apiResult.data === 'object' && 'data' in apiResult.data && Array.isArray(apiResult.data.data)) {
          dataArray = apiResult.data.data;
        } else if (apiResult.data && typeof apiResult.data === 'object' && !Array.isArray(apiResult.data)) {
          dataArray = [apiResult.data];
        }
      }

      if (dataArray.length > 0) {
        // 获取物品数据
        const cardData = dataArray[0];
        console.log('步骤1: 物品数据:', cardData);
        console.log('步骤1: 物品所有属性名:', Object.keys(cardData));

        // 查找 T710063228176306177 属性，获取库位ID
        let locationId = '';

        // 尝试直接获取 T710063228176306177 属性
        if (cardData.T710063228176306177) {
          // 从 T710063228176306177 属性获取库位ID，去掉开头的S
          const rawValue = cardData.T710063228176306177.toString();
          console.log('步骤1: 原始 T710063228176306177 值:', rawValue);

          // 确保转换为字符串并去掉开头的S
          locationId = rawValue.replace(/^S/, '');
          console.log('步骤1: 提取的库位ID (字符串):', locationId);
        } else {
          // 如果找不到精确的属性名，尝试查找包含相关数字的属性
          console.log('步骤1: 未找到 T710063228176306177 属性，搜索其他可能的属性名');

          for (const key of Object.keys(cardData)) {
            if (key.includes('710063228176306177')) {
              const rawValue = cardData[key].toString();
              console.log(`步骤1: 找到匹配属性 ${key}:`, rawValue);
              locationId = rawValue.replace(/^S/, '');
              console.log('步骤1: 提取的库位ID (字符串):', locationId);
              break;
            }
          }
        }

        // 库位信息变量
        let warehouseName = '';
        let shelfId = '';
        let layerId = '';
        let positionId = '';
        let locationInfo = '';
        let warehouseId = '';

        // 使用findLocationByRealId函数查找库位信息
        if (locationId) {
          try {
            console.log('步骤2: 使用findLocationByRealId查询库位信息，库位ID:', locationId);

            const locationResult = await findLocationByRealId(locationId);
            console.log('步骤2: findLocationByRealId返回结果:', locationResult);

            if (locationResult.found) {
              // 从locationResult获取库位信息
              warehouseId = locationResult.warehouseId || '';
              shelfId = locationResult.shelfId || '';
              layerId = locationResult.layerId || '';
              positionId = locationResult.positionId || '';
              locationInfo = locationResult.locationCode || '';

              // 设置仓库名称
              warehouseName = warehouseId === 'warehouse1' ? '公物仓一' : '公物仓二';

              console.log('步骤2: 库位信息查找成功:', {
                warehouseId, warehouseName, shelfId, layerId, positionId, locationInfo
              });
            } else {
              console.log('步骤2: 未找到匹配的库位信息，尝试使用原始方法');

              // 如果findLocationByRealId未找到结果，回退到原始方法
              await fetchLocationInfoUsingOriginalMethod(locationId);
            }
          } catch (error) {
            console.error('步骤2: findLocationByRealId查询出错:', error);

            // 出错时回退到原始方法
            await fetchLocationInfoUsingOriginalMethod(locationId);
          }
        } else {
          console.log('步骤1: 未找到库位ID，尝试使用原始方法');

          // 如果没有找到库位ID，尝试使用原始方法
          await fetchLocationInfoUsingOriginalMethod(locationId);
        }

        // 原始方法获取库位信息的函数
        async function fetchLocationInfoUsingOriginalMethod(locationId: string) {
          try {
            console.log('步骤2: 开始使用原始方法查询库位信息');

            // 使用 warehouseRequest 方法获取库位信息
            const locationResult = await authService.warehouseRequest('Collection', 'Load', {
              requireTotalCount: true,
              options: {
                match: {
                  speciesId: "710060066056966145"
                  // 不在查询参数中指定 _id，而是在返回的数据中手动搜索
                }
              },
              collName: "standard-species-item"
            });

            console.log('步骤2: 库位信息API返回结果:', locationResult);

            // 处理返回结果
            if (locationResult.success && locationResult.data) {
              let locationItems: any[] = [];

              // 将返回的数据转换为数组，方便处理
              if (Array.isArray(locationResult.data)) {
                locationItems = locationResult.data as any[];
              } else if (locationResult.data && typeof locationResult.data === 'object' && 'items' in locationResult.data) {
                locationItems = (locationResult.data.items as any[]) || [];
              } else if (locationResult.data && typeof locationResult.data === 'object') {
                locationItems = [locationResult.data];
              }

              console.log('步骤2: 库位数据项数量:', locationItems.length);

              // 定义递归搜索函数，用于在复杂的数据结构中查找匹配的库位ID
              const findLocationDataRecursively = (items: any[], targetId: string): any => {
                console.log(`步骤2: 递归搜索库位ID ${targetId} 在 ${items.length} 个项中`);

                // 首先尝试直接匹配
                for (const item of items) {
                  if (!item) continue;

                  // 检查当前项的ID
                  const itemId = item._id || item.id || '';
                  if (itemId && itemId.toString() === targetId) {
                    console.log('步骤2: 递归搜索 - 找到精确匹配:', item);
                    return item;
                  }

                  // 检查当前项是否有info属性，如果有且包含库位信息，可能是我们要找的
                  if (item.info && typeof item.info === 'string' && item.info.includes('_')) {
                    console.log('步骤2: 递归搜索 - 找到含info属性的项:', item);
                    return item;
                  }
                }

                // 如果没有直接匹配，尝试递归搜索子项
                for (const item of items) {
                  if (!item || typeof item !== 'object') continue;

                  // 搜索数组类型的属性
                  for (const key in item) {
                    if (Array.isArray(item[key]) && item[key].length > 0) {
                      console.log(`步骤2: 递归搜索 - 检查子数组 ${key}，长度 ${item[key].length}`);
                      const result = findLocationDataRecursively(item[key], targetId);
                      if (result) return result;
                    } else if (item[key] && typeof item[key] === 'object' && 'items' in item[key] && Array.isArray(item[key].items)) {
                      console.log(`步骤2: 递归搜索 - 检查嵌套items ${key}，长度 ${item[key].items.length}`);
                      const result = findLocationDataRecursively(item[key].items, targetId);
                      if (result) return result;
                    }
                  }
                }

                // 如果仍然没有找到，尝试部分匹配
                for (const item of items) {
                  if (!item) continue;

                  const itemId = item._id || item.id || '';
                  if (itemId && (itemId.toString().includes(targetId) || targetId.includes(itemId.toString()))) {
                    console.log('步骤2: 递归搜索 - 找到部分匹配:', item);
                    return item;
                  }
                }

                return null;
              };

              // 在返回的数据中搜索匹配的库位ID
              let locationData: any = null;

              console.log('步骤2: 开始在库位数据中搜索ID:', locationId);

              // 使用递归搜索函数查找匹配的库位ID
              locationData = findLocationDataRecursively(locationItems, locationId);

              // 如果递归搜索未找到，尝试直接搜索整个返回的数据
              if (!locationData) {
                console.log('步骤2: 递归搜索未找到结果，尝试在原始数据中搜索');

                // 将原始数据转换为字符串，查找是否包含库位ID
                const dataString = JSON.stringify(locationResult.data);
                if (dataString.includes(locationId)) {
                  console.log('步骤2: 在原始数据字符串中找到库位ID，尝试提取相关数据');

                  // 尝试找到包含info属性的对象
                  const findObjectWithInfo = (obj: any): any => {
                    if (!obj || typeof obj !== 'object') return null;

                    // 检查当前对象是否有info属性
                    if (obj.info && typeof obj.info === 'string' && obj.info.includes('_')) {
                      return obj;
                    }

                    // 递归检查子对象
                    for (const key in obj) {
                      if (obj[key] && typeof obj[key] === 'object') {
                        const result = findObjectWithInfo(obj[key]);
                        if (result) return result;
                      }
                    }

                    return null;
                  };

                  locationData = findObjectWithInfo(locationResult.data);
                }
              }

              // 如果仍未找到，使用第一个可能包含info属性的记录
              if (!locationData) {
                console.log('步骤2: 所有搜索方法都未找到匹配，尝试查找任何包含info属性的记录');

                // 查找任何包含info属性的记录
                for (const item of locationItems) {
                  if (item && item.info && typeof item.info === 'string' && item.info.includes('_')) {
                    locationData = item;
                    console.log('步骤2: 找到包含info属性的记录:', item);
                    break;
                  }
                }
              }

              // 如果仍未找到，使用第一个记录
              if (!locationData && locationItems.length > 0) {
                locationData = locationItems[0];
                console.log('步骤2: 未找到任何匹配或包含info属性的记录，使用第一个记录:', locationData);
              }

              // 第三步：从库位记录中获取 info 属性，解析库位信息
              if (locationData) {
                console.log('步骤3: 找到的库位数据:', locationData);
                console.log('步骤3: 库位数据字段:', Object.keys(locationData));

                // 尝试获取 info 字段
                locationInfo = locationData.info || '';
                console.log('步骤3: 库位info值:', locationInfo);

                // 如果找不到 info 字段，尝试其他可能的字段名或递归查找
                if (!locationInfo) {
                  console.log('步骤3: 直接的info字段未找到，尝试深度搜索');

                  // 定义递归查找info属性的函数
                  const findInfoProperty = (obj: any): string => {
                    if (!obj || typeof obj !== 'object') return '';

                    // 直接检查当前对象的所有属性
                    for (const key in obj) {
                      // 检查属性名是否包含'info'
                      if (key.toLowerCase().includes('info')) {
                        const value = obj[key];
                        if (typeof value === 'string' && value.includes('_')) {
                          console.log(`步骤3: 在字段 ${key} 中找到可能的库位信息:`, value);
                          return value;
                        }
                      }

                      // 检查字符串类型的属性值是否包含下划线分隔的格式
                      if (typeof obj[key] === 'string' && obj[key].includes('_')) {
                        const parts = obj[key].split('_');
                        if (parts.length >= 5) {
                          console.log(`步骤3: 在字段 ${key} 中找到可能的库位信息格式:`, obj[key]);
                          return obj[key];
                        }
                      }
                    }

                    // 递归检查子对象
                    for (const key in obj) {
                      if (obj[key] && typeof obj[key] === 'object') {
                        const result = findInfoProperty(obj[key]);
                        if (result) return result;
                      }
                    }

                    return '';
                  };

                  locationInfo = findInfoProperty(locationData);

                  // 如果仍未找到，尝试在整个返回数据中搜索
                  if (!locationInfo) {
                    console.log('步骤3: 在库位数据中未找到info，尝试在整个返回数据中搜索');
                    locationInfo = findInfoProperty(locationResult.data);
                  }
                }

                // 解析库位信息，格式如 "AQ_HJ_001_1_1"
                if (locationInfo) {
                  console.log('步骤3: 开始解析库位信息:', locationInfo);
                  const parts = locationInfo.split('_');
                  console.log('步骤3: 库位信息各部分:', parts);

                  if (parts.length >= 5) {
                    // 解析区域信息
                    const area = parts[0]; // 如 "AQ"
                    const shelfType = parts[1]; // 如 "HJ"
                    const shelfNum = parts[2]; // 如 "001"
                    const layer = parts[3]; // 如 "1"
                    const position = parts[4]; // 如 "1"

                    console.log('步骤3: 解析库位信息各部分:', {
                      area, shelfType, shelfNum, layer, position
                    });

                    // 根据区域确定仓库
                    if (['AQ', 'BQ', 'CQ', 'DQ'].includes(area)) {
                      warehouseName = '公物仓一';
                      warehouseId = 'warehouse1';
                    } else if (['EQ', 'FQ'].includes(area)) {
                      warehouseName = '公物仓二';
                      warehouseId = 'warehouse2';
                    }

                    // 构建货架ID
                    // 区域代码的第一个字符 + 货架编号，如 "A" + "001" = "A1"
                    const areaCode = area.charAt(0); // 取第一个字符，如 "A"

                    // 将001转为数字1
                    let shelfNumInt = parseInt(shelfNum, 10);
                    if (isNaN(shelfNumInt)) {
                      shelfNumInt = 1; // 默认为1号货架
                    }

                    // 货架编号为 "A1"，而不是 "A1货架"
                    shelfId = `${areaCode}${shelfNumInt}`;

                    // 设置层和位置
                    layerId = `${shelfId}-L${layer}`;
                    positionId = `${layerId}-P${position}`;

                    console.log('步骤3: 解析库位信息成功:', {
                      warehouseName, warehouseId, shelfId, layerId, positionId, locationInfo
                    });
                  } else {
                    console.warn('步骤3: 库位信息格式不正确，无法解析:', locationInfo);
                  }
                } else {
                  console.log('步骤3: 未找到任何库位信息');
                }
              } else {
                console.log('步骤3: 未找到库位记录，无法获取info字段');
              }
            } else {
              console.log('步骤2: 库位信息API返回失败或无数据');
            }
          } catch (error) {
            console.error('步骤2/3: 获取或解析库位信息失败:', error);
          }
        }

        // 如果没有从T710063228176306177获取到库位信息，尝试从其他字段获取
        if (!shelfId) {
          console.log('尝试从其他字段获取库位信息');
          // 处理库位信息 - 可能来自不同字段
          // 尝试从各种可能的字段中获取货架ID
          const possibleShelfIdFields = [
            'shelfId', 'locationCode', 'T527635724658814976',
            'location', 'shelf', 'position', 'storageLocation'
          ];

          for (const field of possibleShelfIdFields) {
            if (cardData[field]) {
              shelfId = cardData[field];
              console.log(`从字段 ${field} 获取到货架ID: ${shelfId}`);
              break;
            }
          }

          if (!shelfId) {
            shelfId = 'unknown';
            console.log('未找到货架ID，使用默认值');
          }

          // 构造层和位置信息
          layerId = cardData.layerId || `${shelfId}-L1`;
          positionId = cardData.positionId || `${layerId}-P1`;
        }

        // 从返回的数据中提取物品信息，按照特定字段映射
        // name: 物品名称
        // T527635558076391424: 取得日期
        // T527635705355182080: 卡片编码
        // T527635710128300032: 物品名称（新增）
        const item: WarehouseItem = {
          id: cardData.id || cardData._id || cardData.thingId || '',
          name: cardData.T527635710128300032 || cardData.name || cardData.thingName || '未命名物品', // 优先使用T527635710128300032字段作为物品名称
          shelfId: shelfId,
          layerId: layerId,
          positionId: positionId,
          quantity: cardData.quantity || 1,
          sku: cardData.T527635705355182080 || cardData.cardCode || cardCode, // 卡片编码
          category: cardData.category || cardData.type || cardData.thingType || '未分类',
          status: cardData.status || 'normal',
          expiryDate: cardData.T527635558076391424 || cardData.acquireDate || '', // 取得日期
          realLocationId: locationId, // 添加真实库位ID
          locationCode: locationInfo // 添加库位编号
        };

        console.log('最终构建的物品数据:', item);

        const searchResult = {
          found: true,
          item: item,
          shelfId: item.shelfId,
          layerId: item.layerId,
          positionId: item.positionId,
          warehouseId: warehouseId || warehouseId,
          locationInfo: locationInfo // 添加原始库位信息以便ItemsDetail使用
        };

        console.log('最终返回的搜索结果:', searchResult);
        return searchResult;
      } else {
        console.log('步骤1: API返回成功但无数据或数据格式不符合预期');
        if (apiResult.success) {
          console.log('步骤1: API返回数据结构:', apiResult.data);
        }
      }

      return { found: false };
    } catch (error) {
      console.error('搜索过程中发生错误:', error);
      return { found: false };
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      message.warning('请输入卡片编码');
      return;
    }

    setLoading(true);
    try {
      console.log('开始搜索卡片编码:', searchValue.trim());
      const result = await searchItemByCardCode(searchValue.trim());
      console.log('搜索结果:', result);
      setSearchResult(result);

      // 调用父组件的回调函数传递搜索结果
      if (onSearchResult) {
        console.log('调用父组件回调');
        onSearchResult(result);
      }

      if (!result.found) {
        message.info(`未找到编码为 "${searchValue}" 的物品`);
      } else {
        // 显示更详细的成功信息
        let locationDesc = '';

        // 如果有库位信息，添加到成功消息中
        if (result.locationInfo) {
          try {
            const parts = result.locationInfo.split('_');
            if (parts.length >= 5) {
              const area = parts[0].charAt(0); // 如 "A"
              const shelfNum = parseInt(parts[2], 10) || 1; // 如 "001" -> 1
              const layer = parts[3]; // 如 "1"
              const position = parts[4]; // 如 "1"

              // 确定仓库名称
              let warehouseName = '';
              if (['A', 'B', 'C', 'D'].includes(area)) {
                warehouseName = '公物仓一';
              } else if (['E', 'F'].includes(area)) {
                warehouseName = '公物仓二';
              }

              locationDesc = `，位置: ${warehouseName} ${area}${shelfNum} 第${layer}层 ${position}号库位`;
            }
          } catch (error) {
            console.error('解析库位信息出错:', error);
          }
        } else if (result.shelfId) {
          // 如果没有库位信息但有货架ID，使用货架ID
          locationDesc = `，位置: ${result.shelfId}`;
        }

        message.success(`已找到物品: ${result.item?.name || '未命名'}${locationDesc}`);
        console.log('搜索成功, 结果:', result);
      }
    } catch (error) {
      console.error('搜索出错:', error);
      message.error('搜索过程中发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 添加调试渲染函数，检查结果是否正确传递给ItemsDetail
  console.log('当前渲染状态 - searchResult:', searchResult);

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
            <>
              <div style={{ marginBottom: '10px', color: 'green' }}>
                搜索成功，显示物品详情：
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                  (点击顶部"仓库地图"按钮可返回仓库视图)
                </span>
              </div>
            <ItemsDetail
              warehouseId={searchResult.warehouseId || warehouseId}
              selectedShelfId={searchResult.shelfId || null}
              selectedLayerId={searchResult.layerId || null}
              selectedPositionId={searchResult.positionId || null}
              searchItem={searchResult.item}
                locationInfo={searchResult.locationInfo}
            />
            </>
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
