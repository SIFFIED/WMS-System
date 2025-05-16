import { Shelf, ShelfDetail, WarehouseItem, WarehouseMap } from '../types/warehouse';

// 模拟API响应数据
const mockWarehouseData: WarehouseMap = {
  width: 800,
  height: 600,
  shelves: {
    a: [
      { id: 'A1', name: 'A1', itemCount: 8, status: 'normal' },
      { id: 'A2', name: 'A2', itemCount: 12, status: 'normal' },
      { id: 'A3', name: 'A3', itemCount: 5, status: 'warning' },
      { id: 'A4', name: 'A4', itemCount: 10, status: 'normal' },
      { id: 'A5', name: 'A5', itemCount: 3, status: 'danger' },
      { id: 'A6', name: 'A6', itemCount: 7, status: 'normal' },
      { id: 'A7', name: 'A7', itemCount: 9, status: 'normal' },
      { id: 'A8', name: 'A8', itemCount: 6, status: 'normal' },
      { id: 'A9', name: 'A9', itemCount: 11, status: 'normal' },
      { id: 'A10', name: 'A10', itemCount: 4, status: 'warning' },
      { id: 'A11', name: 'A11', itemCount: 8, status: 'normal' },
      { id: 'A12', name: 'A12', itemCount: 9, status: 'normal' },
      { id: 'A13', name: 'A13', itemCount: 2, status: 'danger' },
    ],
    b: [
      { id: 'B1', name: 'B1', itemCount: 7, status: 'normal' },
      { id: 'B2', name: 'B2', itemCount: 5, status: 'warning' },
      { id: 'B3', name: 'B3', itemCount: 10, status: 'normal' },
      { id: 'B4', name: 'B4', itemCount: 8, status: 'normal' },
      { id: 'B5', name: 'B5', itemCount: 4, status: 'warning' },
      { id: 'B6', name: 'B6', itemCount: 12, status: 'normal' },
      { id: 'B7', name: 'B7', itemCount: 9, status: 'normal' },
      { id: 'B8', name: 'B8', itemCount: 6, status: 'normal' },
      { id: 'B9', name: 'B9', itemCount: 11, status: 'normal' },
      { id: 'B10', name: 'B10', itemCount: 3, status: 'danger' },
      { id: 'B11', name: 'B11', itemCount: 7, status: 'normal' },
      { id: 'B12', name: 'B12', itemCount: 8, status: 'normal' },
      { id: 'B13', name: 'B13', itemCount: 5, status: 'warning' },
    ],
    c: [
      { id: 'C1', name: 'C1', itemCount: 9, status: 'normal' },
      { id: 'C2', name: 'C2', itemCount: 4, status: 'warning' },
      { id: 'C3', name: 'C3', itemCount: 11, status: 'normal' },
      { id: 'C4', name: 'C4', itemCount: 7, status: 'normal' },
      { id: 'C5', name: 'C5', itemCount: 3, status: 'danger' },
      { id: 'C6', name: 'C6', itemCount: 10, status: 'normal' },
      { id: 'C7', name: 'C7', itemCount: 8, status: 'normal' },
      { id: 'C8', name: 'C8', itemCount: 5, status: 'warning' },
      { id: 'C9', name: 'C9', itemCount: 12, status: 'normal' },
      { id: 'C10', name: 'C10', itemCount: 6, status: 'normal' },
      { id: 'C11', name: 'C11', itemCount: 9, status: 'normal' },
      { id: 'C12', name: 'C12', itemCount: 4, status: 'warning' },
      { id: 'C13', name: 'C13', itemCount: 7, status: 'normal' },
    ],
    d: [
      { id: 'D1', name: 'D1', itemCount: 6, status: 'normal' },
      { id: 'D2', name: 'D2', itemCount: 3, status: 'danger' },
      { id: 'D3', name: 'D3', itemCount: 9, status: 'normal' },
      { id: 'D4', name: 'D4', itemCount: 5, status: 'warning' },
      { id: 'D5', name: 'D5', itemCount: 10, status: 'normal' },
      { id: 'D6', name: 'D6', itemCount: 7, status: 'normal' },
      { id: 'D7', name: 'D7', itemCount: 4, status: 'warning' },
      { id: 'D8', name: 'D8', itemCount: 11, status: 'normal' },
      { id: 'D9', name: 'D9', itemCount: 8, status: 'normal' },
      { id: 'D10', name: 'D10', itemCount: 5, status: 'warning' },
      { id: 'D11', name: 'D11', itemCount: 9, status: 'normal' },
    ]
  }
};

// 模拟货架详情数据
const generateShelfDetail = (shelfId: string): ShelfDetail => {
  const layers = [1, 2, 3, 4].map(layerNum => ({
    id: `${shelfId}-L${layerNum}`,
    positions: [1, 2, 3].map(posNum => ({
      id: `${shelfId}-L${layerNum}-P${posNum}`,
      name: `${posNum}`
    }))
  }));

  return {
    id: shelfId,
    name: shelfId,
    layers
  };
};

// 模拟物品数据，每个库位可能有0-3个物品
const generateItemsForShelf = (shelfId: string): Record<string, Record<string, WarehouseItem[]>> => {
  const result: Record<string, Record<string, WarehouseItem[]>> = {};

  const layers = [1, 2, 3, 4];
  const positions = [1, 2, 3];

  layers.forEach(layerNum => {
    const layerId = `${shelfId}-L${layerNum}`;
    result[layerId] = {};

    positions.forEach(posNum => {
      const positionId = `${shelfId}-L${layerNum}-P${posNum}`;
      const itemCount = Math.floor(Math.random() * 4); // 0-3个物品

      const items: WarehouseItem[] = [];
      for (let i = 0; i < itemCount; i++) {
        const categories = ['电子', '办公', '工具', '包装', '食品', '服装', '电器'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const statuses = ['normal', 'warning', 'danger'] as const;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        items.push({
          id: `item-${shelfId}-L${layerNum}-P${posNum}-${i}`,
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

      result[layerId][positionId] = items;
    });
  });

  return result;
};

// 生成所有货架的物品数据
const allShelfItemsData: Record<string, Record<string, Record<string, WarehouseItem[]>>> = {};

// 为A、B、C、D区所有货架生成物品
Object.entries(mockWarehouseData.shelves).forEach(([area, shelves]) => {
  shelves.forEach(shelf => {
    allShelfItemsData[shelf.id] = generateItemsForShelf(shelf.id);
  });
});

// 获取仓库地图数据
export const fetchWarehouseMap = (): Promise<WarehouseMap> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWarehouseData);
    }, 500);
  });
};

// 获取货架详细信息
export const fetchShelfDetail = (shelfId: string): Promise<ShelfDetail> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateShelfDetail(shelfId));
    }, 300);
  });
};

// 获取货架层中特定位置的物品
export const fetchPositionItems = (
  shelfId: string,
  layerId: string,
  positionId: string
): Promise<WarehouseItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (
        allShelfItemsData[shelfId] &&
        allShelfItemsData[shelfId][layerId] &&
        allShelfItemsData[shelfId][layerId][positionId]
      ) {
        resolve(allShelfItemsData[shelfId][layerId][positionId]);
      } else {
        resolve([]);
      }
    }, 300);
  });
}; 