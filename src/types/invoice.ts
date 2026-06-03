export interface InvoiceLine {
  rowNo: number;
  itemID: number | '';
  itemName?: string;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
  amount: number;
}

export interface Invoice {
  invoiceID: number;
  invoiceNo: number;
  invoiceDate: string;
  customerName: string;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  updatedOn: string;
  itemsCount?: number;
}

export interface InvoiceDetails {
  invoiceID: number;
  invoiceNo: number;
  invoiceDate: string;
  customerName: string;
  address: string;
  city: string;
  notes: string;
  taxPercentage: number;
  taxAmount: number;
  subTotal: number;
  invoiceAmount: number;
  updatedOn?: string;
  lines: InvoiceLine[];
}

export interface TrendItem {
  monthStart: string;
  invoiceCount: number;
  amountSum: number;
}

export interface TopItem {
  itemID: number | null;
  itemName: string;
  amountSum: number;
}
