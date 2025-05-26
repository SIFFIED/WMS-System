export interface ShelfPosition {
  id: string;
  name: string;
  hasItems?: boolean;
}

export interface Shelf {
  id: string;
  name: string;
  itemCount?: number;
  status?: 'empty' | 'first' | 'second' | 'third' | 'fourth' | 'normal' | 'warning' | 'danger';
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
  id: string;
  name: string;
  width: number;
  height: number;
  shelves: {
    a: Shelf[];
    b: Shelf[];
    c: Shelf[];
    d: Shelf[];
    e?: Shelf[]; // 额外的E区货架（可选）
    f?: Shelf[]; // 额外的F区货架（可选）
    r?: Shelf[]; // 额外的R区货架（可选）
  };
} 