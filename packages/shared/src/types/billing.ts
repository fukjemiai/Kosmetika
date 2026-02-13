export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  customerId?: string;
  beauticianId: string;
  salonId: string;
  // Supplier info (beautician/salon)
  supplierName: string;
  supplierIco?: string;
  supplierDic?: string;
  supplierAddress: string;
  // Customer info
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerIco?: string;
  customerDic?: string;
  // Amounts
  subtotal: number;
  taxRate: number;      // e.g. 21 for 21%
  taxAmount: number;
  total: number;
  currency: string;
  // Dates
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  // Status
  status: InvoiceStatus;
  // Payment
  bankAccount?: string;
  variableSymbol?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface CreateInvoiceDto {
  bookingId?: string;
  customerId?: string;
  beauticianId: string;
  salonId: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerIco?: string;
  customerDic?: string;
  items: CreateInvoiceItemDto[];
  taxRate: number;
  dueDate: string;
  bankAccount?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateInvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface InvoiceFilter {
  salonId?: string;
  beauticianId?: string;
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface BillingSummary {
  totalRevenue: number;
  totalTax: number;
  invoiceCount: number;
  paidCount: number;
  unpaidCount: number;
  periodFrom: string;
  periodTo: string;
}
