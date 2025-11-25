// types/portfolio-item.ts

export interface PortfolioItem {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItemResponse {
  success: boolean;
  message: string;
  data: PortfolioItem;
}

export interface PortfolioItemListResponse {
  success: boolean;
  message: string;
  data: PortfolioItem[];
}

// ================= DTO cho frontend =================
export interface CreatePortfolioItemDto {
  portfolioId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface UpdatePortfolioItemDto {
  symbol?: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
}
