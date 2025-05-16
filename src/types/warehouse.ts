export interface ShelfPosition {
  id: string;
  name: string;
}

export interface Shelf {
  id: string;
  name: string;
  itemCount?: number;
  status?: 'normal' | 'warning' | 'danger';
}

export interface ShelfLayer {
  id: string;
  positions: ShelfPosition[];
}

export interface ShelfDetail {
  id: string;
  name: string;
  layers: ShelfLayer[];
}

export interface WarehouseItem {
  id: string;
  name: string;
  shelfId: string;
  layerId: string;
  positionId: string;
  quantity: number;
  sku: string;
  expiryDate?: string;
  category?: string;
  status?: 'normal' | 'warning' | 'danger';
}

export interface WarehouseMap {
  width: number;
  height: number;
  shelves: {
    a: Shelf[];
    b: Shelf[];
    c: Shelf[];
    d: Shelf[];
  };
} 