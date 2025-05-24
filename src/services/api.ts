import { Shelf, ShelfDetail, WarehouseItem, WarehouseMap } from '../types/warehouse';

// 模拟API响应数据 - 公物仓一
const mockWarehouseData1: WarehouseMap = {
  id: 'warehouse1',
  name: '公物仓（一）',
  width: 800,
  height: 600,
  shelves: {
    a: [
      { id: 'A1', name: 'A1', itemCount: 8, status: 'empty' },
      { id: 'A2', name: 'A2', itemCount: 12, status: 'empty' },
      { id: 'A3', name: 'A3', itemCount: 5, status: 'empty' },
      { id: 'A4', name: 'A4', itemCount: 10, status: 'empty' },
      { id: 'A5', name: 'A5', itemCount: 3, status: 'empty' },
      { id: 'A6', name: 'A6', itemCount: 7, status: 'empty' },
      { id: 'A7', name: 'A7', itemCount: 9, status: 'empty' },
      { id: 'A8', name: 'A8', itemCount: 6, status: 'empty' },
      { id: 'A9', name: 'A9', itemCount: 11, status: 'empty' },
      { id: 'A10', name: 'A10', itemCount: 4, status: 'empty' },
      { id: 'A11', name: 'A11', itemCount: 8, status: 'empty' },
      { id: 'A12', name: 'A12', itemCount: 9, status: 'empty' },
      { id: 'A13', name: 'A13', itemCount: 2, status: 'empty' },
    ],
    b: [
      { id: 'B1', name: 'B1', itemCount: 7, status: 'empty' },
      { id: 'B2', name: 'B2', itemCount: 5, status: 'empty' },
      { id: 'B3', name: 'B3', itemCount: 10, status: 'empty' },
      { id: 'B4', name: 'B4', itemCount: 8, status: 'empty' },
      { id: 'B5', name: 'B5', itemCount: 4, status: 'empty' },
      { id: 'B6', name: 'B6', itemCount: 12, status: 'empty' },
      { id: 'B7', name: 'B7', itemCount: 9, status: 'empty' },
      { id: 'B8', name: 'B8', itemCount: 6, status: 'empty' },
      { id: 'B9', name: 'B9', itemCount: 11, status: 'empty' },
      { id: 'B10', name: 'B10', itemCount: 3, status: 'empty' },
      { id: 'B11', name: 'B11', itemCount: 7, status: 'empty' },
      { id: 'B12', name: 'B12', itemCount: 8, status: 'empty' },
      { id: 'B13', name: 'B13', itemCount: 5, status: 'empty' },
    ],
    c: [
      { id: 'C1', name: 'C1', itemCount: 9, status: 'empty' },
      { id: 'C2', name: 'C2', itemCount: 4, status: 'empty' },
      { id: 'C3', name: 'C3', itemCount: 11, status: 'empty' },
      { id: 'C4', name: 'C4', itemCount: 7, status: 'empty' },
      { id: 'C5', name: 'C5', itemCount: 3, status: 'empty' },
      { id: 'C6', name: 'C6', itemCount: 10, status: 'empty' },
      { id: 'C7', name: 'C7', itemCount: 8, status: 'empty' },
      { id: 'C8', name: 'C8', itemCount: 5, status: 'empty' },
      { id: 'C9', name: 'C9', itemCount: 12, status: 'empty' },
      { id: 'C10', name: 'C10', itemCount: 6, status: 'empty' },
      { id: 'C11', name: 'C11', itemCount: 9, status: 'empty' },
      { id: 'C12', name: 'C12', itemCount: 4, status: 'empty' },
      { id: 'C13', name: 'C13', itemCount: 7, status: 'empty' },
    ],
    d: [
      { id: 'D1', name: 'D1', itemCount: 6, status: 'empty' },
      { id: 'D2', name: 'D2', itemCount: 3, status: 'empty' },
      { id: 'D3', name: 'D3', itemCount: 9, status: 'empty' },
      { id: 'D4', name: 'D4', itemCount: 5, status: 'empty' },
      { id: 'D5', name: 'D5', itemCount: 10, status: 'empty' },
      { id: 'D6', name: 'D6', itemCount: 7, status: 'empty' },
      { id: 'D7', name: 'D7', itemCount: 4, status: 'empty' },
      { id: 'D8', name: 'D8', itemCount: 11, status: 'empty' },
      { id: 'D9', name: 'D9', itemCount: 8, status: 'empty' },
      { id: 'D10', name: 'D10', itemCount: 5, status: 'empty' },
      { id: 'D11', name: 'D11', itemCount: 9, status: 'empty' },
    ]
  }
};

// 模拟API响应数据 - 公物仓二
const mockWarehouseData2: WarehouseMap = {
  id: 'warehouse2',
  name: '公物仓（二）',
  width: 800,
  height: 600,
  shelves: {
    // 必需的字段，但为空数组
    a: [],
    b: [],
    c: [],
    d: [],
    // 顶部横向排列的E区货架 - 已全部移除
    e: [],
    // 右侧F区货架 - 从上到下F16A、F16B、F16C、F16D
    f: [
      { id: 'F16A', name: 'F16A', itemCount: 8, status: 'third' }, // 可点击的货架，有3层物品
      { id: 'F16B', name: 'F16B', itemCount: 8, status: 'third' }, // 可点击的货架，有3层物品
      { id: 'F16C', name: 'F16C', itemCount: 8, status: 'third' }, // 可点击的货架，有3层物品
      { id: 'F16D', name: 'F16D', itemCount: 8, status: 'third' }, // 可点击的货架，有3层物品
    ],
    // 左侧货架 - 从上到下F18A、F18B、F14、F13
    r: [
      { id: 'F18A', name: 'F18A', itemCount: 5, status: 'fourth' }, // 可点击的货架，有4层物品
      { id: 'F18B', name: 'F18B', itemCount: 5, status: 'fourth' }, // 可点击的货架，有4层物品
      { id: 'F14', name: 'F14', itemCount: 7, status: 'second' }, // 可点击的货架，有2层物品
      { id: 'F13', name: 'F13', itemCount: 10, status: 'first' }, // 可点击的货架，有1层物品
    ],
  }
};

// 所有仓库的集合
const allWarehouses: Record<string, WarehouseMap> = {
  warehouse1: mockWarehouseData1,
  warehouse2: mockWarehouseData2
};

// 为各仓库生成物品数据
const allWarehouseItemsData: Record<string, Record<string, Record<string, Record<string, WarehouseItem[]>>>> = {
  warehouse1: {},
  warehouse2: {}
};

// 模拟货架详情数据
const generateShelfDetail = (warehouseId: string, shelfId: string): ShelfDetail => {
  const shelfItemsData = allWarehouseItemsData[warehouseId]?.[shelfId] || {};

  const layers = [1, 2, 3, 4].map(layerNum => {
    const layerId = `${shelfId}-L${layerNum}`;

    return {
      id: layerId,
      positions: [1, 2, 3].map(posNum => {
        const positionId = `${shelfId}-L${layerNum}-P${posNum}`;
        const hasItems = shelfItemsData[layerId] &&
          shelfItemsData[layerId][positionId] &&
          shelfItemsData[layerId][positionId].length > 0;

        return {
          id: positionId,
          name: `${posNum}`,
          hasItems
        };
      })
    };
  });

  return {
    id: shelfId,
    name: shelfId,
    layers
  };
};

// 生成固定的物品数据（不再随机）
const generateItemsForShelf = (warehouseId: string, shelfId: string): Record<string, Record<string, WarehouseItem[]>> => {
  const result: Record<string, Record<string, WarehouseItem[]>> = {};

  // 默认所有层和库位都无物品
  for (let layerNum = 1; layerNum <= 4; layerNum++) {
    const layerId = `${shelfId}-L${layerNum}`;
    result[layerId] = {};

    for (let posNum = 1; posNum <= 3; posNum++) {
      const positionId = `${shelfId}-L${layerNum}-P${posNum}`;
      result[layerId][positionId] = [];
    }
  }

  // 根据货架ID设置固定的物品分布模式
  const firstChar = shelfId.charAt(0);
  const shelfNum = parseInt(shelfId.substring(1)) || 0; // 如果解析失败返回0

  // 公物仓一的货架分配逻辑
  if (warehouseId === 'warehouse1') {
    // A区货架：按模式分配物品
    if (firstChar === 'A') {
      if (shelfNum <= 3) {
        // A1-A3：只有第一层有物品（显示蓝色）
        addItemsToLayer(result, shelfId, 1, 2);
      } else if (shelfNum <= 6) {
        // A4-A6：有两层有物品（显示绿色）
        addItemsToLayer(result, shelfId, 1, 2);
        addItemsToLayer(result, shelfId, 2, 1);
      } else if (shelfNum <= 9) {
        // A7-A9：有三层有物品（显示黄色）
        addItemsToLayer(result, shelfId, 1, 2);
        addItemsToLayer(result, shelfId, 2, 1);
        addItemsToLayer(result, shelfId, 3, 2);
      } else if (shelfNum <= 12) {
        // A10-A12：四层都有物品（显示红色）
        addItemsToLayer(result, shelfId, 1, 2);
        addItemsToLayer(result, shelfId, 2, 1);
        addItemsToLayer(result, shelfId, 3, 2);
        addItemsToLayer(result, shelfId, 4, 1);
      }
      // A13：保持空（显示灰色）
    }

    // B区货架：类似A区但错开
    if (firstChar === 'B') {
      if (shelfNum <= 3) {
        // B1-B3：四层都有物品（显示红色）
        addItemsToLayer(result, shelfId, 1, 1);
        addItemsToLayer(result, shelfId, 2, 2);
        addItemsToLayer(result, shelfId, 3, 1);
        addItemsToLayer(result, shelfId, 4, 2);
      } else if (shelfNum <= 6) {
        // B4-B6：有三层有物品（显示黄色）
        addItemsToLayer(result, shelfId, 1, 1);
        addItemsToLayer(result, shelfId, 3, 2);
        addItemsToLayer(result, shelfId, 4, 1);
      } else if (shelfNum <= 9) {
        // B7-B9：有两层有物品（显示绿色）
        addItemsToLayer(result, shelfId, 2, 2);
        addItemsToLayer(result, shelfId, 4, 1);
      } else if (shelfNum <= 12) {
        // B10-B12：只有第一层有物品（显示蓝色）
        addItemsToLayer(result, shelfId, 1, 2);
      }
      // B13：保持空（显示灰色）
    }

    // C区货架：交错模式
    if (firstChar === 'C') {
      if (shelfNum % 4 === 1) {
        // C1, C5, C9, C13：只有第一层有物品（显示蓝色）
        addItemsToLayer(result, shelfId, 1, 2);
      } else if (shelfNum % 4 === 2) {
        // C2, C6, C10：有两层有物品（显示绿色）
        addItemsToLayer(result, shelfId, 2, 2);
        addItemsToLayer(result, shelfId, 3, 1);
      } else if (shelfNum % 4 === 3) {
        // C3, C7, C11：有三层有物品（显示黄色）
        addItemsToLayer(result, shelfId, 1, 1);
        addItemsToLayer(result, shelfId, 3, 2);
        addItemsToLayer(result, shelfId, 4, 1);
      } else if (shelfNum % 4 === 0) {
        // C4, C8, C12：四层都有物品（显示红色）
        addItemsToLayer(result, shelfId, 1, 1);
        addItemsToLayer(result, shelfId, 2, 2);
        addItemsToLayer(result, shelfId, 3, 1);
        addItemsToLayer(result, shelfId, 4, 2);
      }
    }

    // D区货架：均匀分布
    if (firstChar === 'D') {
      if (shelfNum <= 3) {
        // D1-D3：四层都有物品（显示红色）
        for (let layer = 1; layer <= 4; layer++) {
          addItemsToLayer(result, shelfId, layer, 1);
        }
      } else if (shelfNum <= 6) {
        // D4-D6：有三层有物品（显示黄色）
        for (let layer = 1; layer <= 3; layer++) {
          addItemsToLayer(result, shelfId, layer, 1);
        }
      } else if (shelfNum <= 9) {
        // D7-D9：有两层有物品（显示绿色）
        for (let layer = 1; layer <= 2; layer++) {
          addItemsToLayer(result, shelfId, layer, 1);
        }
      } else {
        // D10-D11：只有第一层有物品（显示蓝色）
        addItemsToLayer(result, shelfId, 1, 1);
      }
    }
  }

  // 公物仓二的货架分配逻辑
  else if (warehouseId === 'warehouse2') {
    // 根据货架ID生成物品
    if (shelfId === 'F13') {
      // F13：只有第一层有物品（显示蓝色）
      addItemsToLayer(result, shelfId, 1, 2);
    } else if (shelfId === 'F14') {
      // F14：有两层有物品（显示绿色）
      addItemsToLayer(result, shelfId, 1, 1);
      addItemsToLayer(result, shelfId, 2, 2);
    } else if (shelfId.startsWith('F16')) {
      // F16A-D：有三层有物品（显示黄色）
      addItemsToLayer(result, shelfId, 1, 1);
      addItemsToLayer(result, shelfId, 2, 2);
      addItemsToLayer(result, shelfId, 3, 1);
    } else if (shelfId.startsWith('F18')) {
      // F18A-B：四层都有物品（显示红色）
      for (let layer = 1; layer <= 4; layer++) {
        addItemsToLayer(result, shelfId, layer, 1);
      }
    }
  }

  return result;
};

// 辅助函数：向指定层的指定库位添加物品
const addItemsToLayer = (
  result: Record<string, Record<string, WarehouseItem[]>>,
  shelfId: string,
  layerNum: number,
  itemCount: number
) => {
  const layerId = `${shelfId}-L${layerNum}`;
  const firstChar = shelfId.charAt(0);

  // 根据不同区域设置不同的物品类别
  let category = '电子';
  if (['A', 'E'].includes(firstChar)) category = '电子';
  else if (['B', 'F'].includes(firstChar)) category = '办公';
  else if (['C', 'R'].includes(firstChar)) category = '工具';
  else if (firstChar === 'D') category = '包装';

  // 为所有库位添加物品
  for (let posNum = 1; posNum <= 3; posNum++) {
    const positionId = `${shelfId}-L${layerNum}-P${posNum}`;

    // 创建该库位的物品
    const items: WarehouseItem[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: `item-${shelfId}-L${layerNum}-P${posNum}-${i}`,
        name: `${category}物品${String.fromCharCode(65 + i)}`,
        shelfId,
        layerId,
        positionId,
        quantity: 10 + layerNum * 2 + posNum,
        sku: `SKU-${category}-${layerNum * 100 + posNum * 10 + i}`,
        category,
        status: 'normal',
        expiryDate: `2024-${layerNum + 1}-${posNum * 5}`
      });
    }

    result[layerId][positionId] = items;
  }
};

// 为A、B、C、D区所有货架生成物品 (公物仓一)
Object.entries(mockWarehouseData1.shelves).forEach(([area, shelves]) => {
  allWarehouseItemsData.warehouse1[area] = {};
  shelves.forEach(shelf => {
    allWarehouseItemsData.warehouse1[shelf.id] = generateItemsForShelf('warehouse1', shelf.id);
  });
});

// 为E、F、R区所有货架生成物品 (公物仓二)
Object.entries(mockWarehouseData2.shelves).forEach(([area, shelves]) => {
  allWarehouseItemsData.warehouse2[area] = {};
  shelves.forEach(shelf => {
    allWarehouseItemsData.warehouse2[shelf.id] = generateItemsForShelf('warehouse2', shelf.id);
  });
});

// 更新货架状态，根据有物品的层数
const updateShelfStatuses = (warehouseId: string) => {
  const warehouseData = allWarehouses[warehouseId];
  if (!warehouseData) return;

  Object.entries(warehouseData.shelves).forEach(([area, shelves]) => {
    shelves.forEach((shelf: Shelf) => {
      const shelfId = shelf.id;
      const shelfItemsData = allWarehouseItemsData[warehouseId]?.[shelfId] || {};

      // 检查各层是否有物品
      const layersWithItems = [];

      for (let layerNum = 1; layerNum <= 4; layerNum++) {
        const layerId = `${shelfId}-L${layerNum}`;
        if (checkLayerHasItems(shelfItemsData, layerId)) {
          layersWithItems.push(layerNum);
        }
      }

      // 根据有物品的层数设置货架状态
      const layerCount = layersWithItems.length;

      if (layerCount === 0) {
        shelf.status = 'empty'; // 没有层有物品 - 灰色
      } else if (layerCount === 1) {
        shelf.status = 'first'; // 1层有物品 - 蓝色
      } else if (layerCount === 2) {
        shelf.status = 'second'; // 2层有物品 - 绿色
      } else if (layerCount === 3) {
        shelf.status = 'third'; // 3层有物品 - 黄色
      } else if (layerCount === 4) {
        shelf.status = 'fourth'; // 4层都有物品 - 红色
      }
    });
  });
};

// 辅助函数：检查某一层是否有物品
const checkLayerHasItems = (
  shelfItemsData: Record<string, Record<string, WarehouseItem[]>>,
  layerId: string
): boolean => {
  if (!shelfItemsData[layerId]) return false;

  // 检查该层的所有库位是否有物品
  return Object.values(shelfItemsData[layerId]).some(
    items => items && items.length > 0
  );
};

// 调用更新函数，更新两个仓库的状态
updateShelfStatuses('warehouse1');
updateShelfStatuses('warehouse2');

// 获取所有仓库列表
export const fetchWarehouseList = (): Promise<{ id: string; name: string }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(allWarehouses).map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name
      })));
    }, 300);
  });
};

// 获取仓库地图数据
export const fetchWarehouseMap = (warehouseId: string = 'warehouse1'): Promise<WarehouseMap> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allWarehouses[warehouseId] || mockWarehouseData1);
    }, 500);
  });
};

// 获取货架详细信息
export const fetchShelfDetail = (warehouseId: string = 'warehouse1', shelfId: string): Promise<ShelfDetail> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateShelfDetail(warehouseId, shelfId));
    }, 300);
  });
};

// 获取货架层中特定位置的物品
export const fetchPositionItems = (
  warehouseId: string = 'warehouse1',
  shelfId: string,
  layerId: string,
  positionId: string
): Promise<WarehouseItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (
        allWarehouseItemsData[warehouseId] &&
        allWarehouseItemsData[warehouseId][shelfId] &&
        allWarehouseItemsData[warehouseId][shelfId][layerId] &&
        allWarehouseItemsData[warehouseId][shelfId][layerId][positionId]
      ) {
        resolve(allWarehouseItemsData[warehouseId][shelfId][layerId][positionId]);
      } else {
        resolve([]);
      }
    }, 300);
  });
}; 