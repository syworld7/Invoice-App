export interface Item {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  updatedOn: string;
  pictureUrl?: string | null;
}

export interface LookupItem {
  itemID: number;
  itemName: string;
  salesRate: number;
  discountPct: number;
}
