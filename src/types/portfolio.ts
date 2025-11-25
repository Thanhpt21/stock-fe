export interface Portfolio {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioResponse {
  success: boolean;
  message: string;
  data: Portfolio;
}

export interface PortfolioListResponse {
  success: boolean;
  message: string;
  data: Portfolio[];
}


export interface CreatePortfolioDto {
  name: string
  description?: string
  isDefault?: boolean
}

export interface UpdatePortfolioDto {
  name?: string
  description?: string
  isDefault?: boolean
}
