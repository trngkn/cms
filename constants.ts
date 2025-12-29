
import { TransactionType, TransactionStatus, Transaction } from './types';
import { generateId } from './utils';

export const INITIAL_SUGGESTIONS = {
  customers: ['Nguyễn Văn Anh', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Minh Đức', 'Hoàng Gia Bảo', 'Đặng Thu Thảo', 'Vũ Minh Hải', 'Ngô Thanh Vân', 'Bùi Xuân Huấn', 'Phan Quân'],
  pos: ['POS VPBank - Q1', 'POS Techcombank - Q3', 'POS TPBank - Tân Bình', 'POS VIB - Cầu Giấy', 'POS MB - Hoàn Kiếm', 'POS Sacombank - Thủ Đức'],
  banks: ['Techcombank', 'VPBank', 'Vietcombank', 'MB Bank', 'TPBank', 'VIB', 'Sacombank', 'ACB'],
  cardTypes: ['Visa Signature', 'Mastercard World', 'JCB Platinum', 'Visa Infinite', 'Visa Platinum', 'American Express']
};

const sales = ['admin', 'manager', 'user'];

const generateRandomDate = (monthsAgo: number) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * monthsAgo), Math.floor(Math.random() * 28) + 1);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const generateRandomTransactions = (count: number): Transaction[] => {
  const txs: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const amount = Math.floor(Math.random() * (200000000 - 5000000) + 5000000);
    const posFeePercent = parseFloat((Math.random() * (1.9 - 1.5) + 1.5).toFixed(2));
    const customerFeePercent = parseFloat((Math.random() * (3.5 - 2.0) + 2.0).toFixed(2));
    
    const posCost = Math.round(amount * (posFeePercent / 100));
    const customerCharge = Math.round(amount * (customerFeePercent / 100));
    const profit = customerCharge - posCost;
    
    const type = [TransactionType.WITHDRAW, TransactionType.RENEW, TransactionType.BOTH][Math.floor(Math.random() * 3)];
    const status = Math.random() > 0.3 ? TransactionStatus.PAID : TransactionStatus.UNPAID;

    txs.push({
      id: generateId(),
      timestamp: generateRandomDate(3),
      sale: sales[Math.floor(Math.random() * sales.length)],
      customerName: INITIAL_SUGGESTIONS.customers[Math.floor(Math.random() * INITIAL_SUGGESTIONS.customers.length)],
      bank: INITIAL_SUGGESTIONS.banks[Math.floor(Math.random() * INITIAL_SUGGESTIONS.banks.length)],
      cardType: INITIAL_SUGGESTIONS.cardTypes[Math.floor(Math.random() * INITIAL_SUGGESTIONS.cardTypes.length)],
      lastFourDigits: Math.floor(1000 + Math.random() * 9000).toString(),
      type,
      amount,
      withdrawAmount: amount,
      pos: INITIAL_SUGGESTIONS.pos[Math.floor(Math.random() * INITIAL_SUGGESTIONS.pos.length)],
      posFeePercent,
      posCost,
      customerFeePercent,
      customerCharge,
      profit,
      status,
      depositImages: [],
      withdrawImages: []
    });
  }
  
  // Sắp xếp theo ngày mới nhất
  return txs.sort((a, b) => {
    const [d1, m1, y1] = a.timestamp.split('/').map(Number);
    const [d2, m2, y2] = b.timestamp.split('/').map(Number);
    return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
  });
};

export const MOCK_TRANSACTIONS: Transaction[] = generateRandomTransactions(30);
