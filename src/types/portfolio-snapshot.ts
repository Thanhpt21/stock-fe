export interface PortfolioSnapshot {
  id: number;
  portfolioId: number;
  totalValue: number;
  snapshotDate: string;
  createdAt: string;
}

export interface PortfolioSnapshotResponse {
  success: boolean;
  message: string;
  data: PortfolioSnapshot;
}

export interface PortfolioSnapshotListResponse {
  success: boolean;
  message: string;
  data: PortfolioSnapshot[];
}

export interface CreatePortfolioSnapshotDto {
  portfolioId: number;
  totalValue?: number;
}
