// types/trading-account.ts
export interface TradingAccount {
  id: number;
  userId: number;
  accountNumber: string;
  accountName: string;
  brokerName: string;
  balance: number;
  availableCash: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface TradingAccountResponse {
  success?: boolean;
  message?: string;
  data: TradingAccount;
}

export interface TradingAccountListResponse {
  success?: boolean;
  message?: string;
  data: TradingAccount[];
}

export interface CreateTradingAccountDto {
  userId: number;
  accountName: string;
  brokerName?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export interface UpdateTradingAccountDto {
  accountName?: string;
  brokerName?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}
