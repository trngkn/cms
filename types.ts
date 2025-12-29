
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar?: string; // Base64 image
  password?: string; // Plain text for demo purposes
}

export enum TransactionType {
  WITHDRAW = 'Rút',
  RENEW = 'Đáo',
  BOTH = 'Rút/Đáo'
}

export enum TransactionStatus {
  PAID = 'Đã thanh toán',
  UNPAID = 'Chưa thanh toán'
}

export interface Customer {
  id: string;
  name: string;
  bank: string;
  cardType: string;
  lastFourDigits: string;
  idCardImages?: string[];
  cardImages?: string[];
  isHoldingCard: boolean;
}

export interface Transaction {
  id: string;
  timestamp: string;
  sale: string;
  customerName: string;
  bank: string;
  cardType: string;
  lastFourDigits: string;
  type: TransactionType;
  amount: number;
  withdrawAmount: number;
  pos: string;
  posFeePercent: number;
  posCost: number;
  customerFeePercent: number;
  customerCharge: number;
  profit: number;
  status: TransactionStatus;
  depositImages: string[];
  withdrawImages: string[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskComment {
  id: string;
  author: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  assignedToNames: string[];
  createdBy: string;
  createdAt: string;
  status: TaskStatus;
  comments: TaskComment[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
  targetUser?: string;
}
