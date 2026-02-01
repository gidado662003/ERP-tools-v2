export type CountList = {
  countTotal: number;
  approvedTotal: number;
  pendingTotal: number;
  rejectedTotal: number;
  outstandingTotal: number;
};

// Nested types
export type User = {
  name: string;
  email: string;
  department: string;
};

export type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
  id: string;
  total: number;
  _id: string;
};

export type Account = {
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export type Approval = {
  name: string;
  email: string;
  department: string;
};

export type InternalRequisition = {
  paymentMethod: string | null;
  bank: string | null;
  referenceNumber: string | null;
  amountPaid: number;
  paymentType: string | null;
  _id: string;
  title: string;
  department: string;
  priority: string;
  category: string;
  approvedOn: string | null;
  rejectedOn: string | null;
  comment: string;
  requestedOn: string;
  location: string;
  items: Item[];
  user: User;
  attachments: any[];
  approvedByFinance: Approval | null;
  approvedByHeadOfDepartment: boolean;
  totalAmount: number;
  requisitionNumber: string;
  accountToPay: Account | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentHistory: any[];
  amountRemaining: number;
  id: string;
};

export type InternalRequisitionOutPut = {
  data: InternalRequisition;
};
