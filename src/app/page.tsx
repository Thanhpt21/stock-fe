'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, Users, Shield, Clock, Zap, ArrowUp, ArrowDown, Eye, Calendar, DollarSign, PieChart, Activity, Heart, Plus } from 'lucide-react'
import { useBatchStockPrices } from '@/hooks/stock/useBatchStockPrices'
import { useMarketOverview } from '@/hooks/stock/useMarketOverview'
import { StockData } from '@/types/stock'
import { Watchlist } from '@/types/watchlist.type'
import { useWatchlists } from '@/hooks/watchlist/useWatchlists'
import { useAddToWatchlist } from '@/hooks/watchlist/useAddToWatchlist'

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

// Danh sách cổ phiếu mặc định để hiển thị
const DEFAULT_STOCKS = ["VIC", "VNM", "HPG", "SSI", "FPT", "ACB", "SHB", "OCH"];

export default function StockHomePage() {
  const [activeTab, setActiveTab] = useState<'hose' | 'hnx' | 'upcom'>('hose');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [selectedStockForWatchlist, setSelectedStockForWatchlist] = useState<StockData | null>(null);

  // Lấy dữ liệu realtime
  const { 
    data: realtimeStocks = [], 
    isLoading: stocksLoading, 
    isFetching: stocksRefreshing,
    error: stocksError 
  } = useBatchStockPrices({
    symbols: DEFAULT_STOCKS,
    refetchInterval: 3000, // 3 giây refresh
  });

  // Lấy tổng quan thị trường realtime
  const { 
    data: marketOverview 
  } = useMarketOverview(10000); // 10 giây refresh

  // Watchlist hooks
  const { data: watchlists, isLoading: watchlistsLoading } = useWatchlists();
  const addToWatchlist = useAddToWatchlist();
  const { hasStockInAnyWatchlist, getDefaultWatchlist } = useWatchlists();

  // Lọc stocks theo market
  const stocks = realtimeStocks.filter((stock: StockData) => {
    if (activeTab === 'hose') return stock.market === 'HOSE'
    if (activeTab === 'hnx') return stock.market === 'HNX'
    if (activeTab === 'upcom') return stock.market === 'UPCOM'
    return true
  });

  // Mock chart data (tạm thời vì chưa có API chart)
  const generateChartData = (basePrice: number, volatility: number): ChartData[] => {
    const data: ChartData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = Math.max(currentPrice + change, basePrice * 0.9);
      
      data.push({
        time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
        price: Math.round(currentPrice),
        volume: Math.round(Math.random() * 1000000)
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0]);
      setChartData(generateChartData(stocks[0].price, stocks[0].price * 0.02));
    }
  }, [stocks, selectedStock]);

  useEffect(() => {
    if (selectedStock) {
      // Cập nhật chart data khi selected stock thay đổi
      const currentStock = realtimeStocks.find((s: any) => s.symbol === selectedStock.symbol);
      if (currentStock) {
        setSelectedStock(currentStock);
        setChartData(generateChartData(currentStock.price, currentStock.price * 0.02));
      }
    }
  }, [realtimeStocks, selectedStock]);

  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
    setChartData(generateChartData(stock.price, stock.price * 0.02));
  };

  const handleAddToWatchlist = (stock: StockData, watchlistId?: number) => {
    const targetWatchlistId = watchlistId || getDefaultWatchlist()?.id;
    
    if (!targetWatchlistId) {
      // Nếu không có watchlist nào, hiển thị modal chọn watchlist
      setSelectedStockForWatchlist(stock);
      setShowWatchlistModal(true);
      return;
    }

    addToWatchlist.mutate({
      watchlistId: targetWatchlistId,
      data: { symbol: stock.symbol }
    });
  };

  const handleQuickAddToWatchlist = (stock: StockData) => {
    handleAddToWatchlist(stock);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Market stats từ real data
  const getMarketStats = () => {
    if (!marketOverview) {
      return {
        hose: { change: 0, volume: '0', value: '0' },
        hnx: { change: 0, volume: '0', value: '0' },
        upcom: { change: 0, volume: '0', value: '0' }
      }
    }

    const stats: any = {}
    marketOverview.forEach((market: any) => {
      stats[market.market.toLowerCase()] = {
        change: market.averageChange,
        volume: `${(market.totalVolume / 1000000).toFixed(1)}M`,
        value: `${(market.totalVolume * 10000 / 1000000000).toFixed(1)}B` // Ước tính
      }
    })

    return stats
  }

  const marketStats = getMarketStats()

  // Đếm số lượng stocks theo market từ real data
  const getStockCounts = () => {
    const hoseCount = realtimeStocks.filter((stock: StockData) => stock.market === 'HOSE').length
    const hnxCount = realtimeStocks.filter((stock: StockData)  => stock.market === 'HNX').length
    const upcomCount = realtimeStocks.filter((stock: StockData)  => stock.market === 'UPCOM').length
    
    return {
      hose: hoseCount,
      hnx: hnxCount,
      upcom: upcomCount
    }
  }

  const stockCounts = getStockCounts()

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Dữ liệu thời gian thực",
      description: "Cập nhật liên tục giá cổ phiếu và chỉ số thị trường"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Phân tích kỹ thuật",
      description: "Công cụ phân tích chart và chỉ báo kỹ thuật chuyên sâu"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Thông tin xác thực",
      description: "Dữ liệu chính thống từ HOSE, HNX, UPCOM"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Tốc độ nhanh",
      description: "Truy cập nhanh chóng với độ trễ thấp nhất"
    }
  ];

  // Calculate chart dimensions and values
  const chartHeight = 200;
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Nền tảng 
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Chứng khoán </span>
              Thông minh
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Cung cấp dữ liệu thời gian thực, công cụ phân tích và thông tin chi tiết 
              để đưa ra quyết định đầu tư thông minh
              {stocksRefreshing && (
                <span className="ml-2 text-sm text-green-600 animate-pulse">
                  ● Đang cập nhật
                </span>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Bắt đầu đầu tư
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all">
                Tìm hiểu thêm
              </button>
            </div>

            {/* Market Overview - Realtime */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {Object.entries(marketStats).map(([market, stats]: [string, any]) => (
                <div key={market} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 uppercase">{market}</h3>
                    <div className={`flex items-center ${stats.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="font-semibold">{Math.abs(stats.change)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>KLGD:</span>
                      <span className="font-semibold">{stats.volume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GTGD:</span>
                      <span className="font-semibold">{stats.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stock Charts Section - Realtime */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Biểu đồ theo dõi {stocksRefreshing && (
                <span className="ml-2 text-sm text-green-600 animate-pulse">
                  ● Live
                </span>
              )}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Theo dõi biến động giá cổ phiếu theo thời gian thực
            </p>
          </div>

          {stocksLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-600">Đang tải dữ liệu thị trường...</p>
            </div>
          ) : stocksError ? (
            <div className="text-center py-12 text-red-600">
              Lỗi khi tải dữ liệu: {stocksError.message}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stock List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Danh sách mã</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {stocks.map((stock: StockData) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors group relative ${
                          selectedStock?.symbol === stock.symbol 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{stock.symbol}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {stock.market}
                              </span>
                              {hasStockInAnyWatchlist(stock.symbol) && (
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{stock.companyName || 'Công ty cổ phần'}</p>
                          </div>
                          <div className={`text-right ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div className="font-bold">{formatNumber(stock.price)}</div>
                            <div className="text-sm">
                              {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Add Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAddToWatchlist(stock);
                          }}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white shadow-sm hover:bg-gray-50"
                          title="Thêm vào watchlist"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-2">
                {selectedStock && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h3>
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {selectedStock.market}
                          </span>
                          {hasStockInAnyWatchlist(selectedStock.symbol) && (
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                          )}
                        </div>
                        <p className="text-gray-600">{selectedStock.companyName || 'Công ty cổ phần'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuickAddToWatchlist(selectedStock)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm vào Watchlist
                        </button>
                        <div className={`text-right ${
                          selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className="text-3xl font-bold">{formatNumber(selectedStock.price)}</div>
                          <div className="flex items-center justify-end gap-1">
                            {selectedStock.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            <span className="font-semibold">
                              {selectedStock.change >= 0 ? '+' : ''}{formatNumber(selectedStock.change)} 
                              ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Container - Giữ nguyên */}
                    <div className="relative">
                      <div className="h-64 bg-gray-50 rounded-lg p-4">
                        {/* Y-axis labels */}
                        <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500">
                          <span>{formatNumber(maxPrice)}</span>
                          <span>{formatNumber((maxPrice + minPrice) / 2)}</span>
                          <span>{formatNumber(minPrice)}</span>
                        </div>
                        
                        {/* Chart */}
                        <div className="ml-12 h-full relative">
                          <svg width="100%" height="100%" className="overflow-visible">
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />
                            
                            {/* Price line */}
                            <path
                              d={chartData.map((point, index) => {
                                const x = (index / (chartData.length - 1)) * 100;
                                const y = ((maxPrice - point.price) / priceRange) * 100;
                                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                              }).join(' ')}
                              stroke={selectedStock.change >= 0 ? "#10b981" : "#ef4444"}
                              strokeWidth="2"
                              fill="none"
                            />
                            
                            {/* Data points */}
                            {chartData.map((point, index) => {
                              const x = (index / (chartData.length - 1)) * 100;
                              const y = ((maxPrice - point.price) / priceRange) * 100;
                              return (
                                <circle
                                  key={index}
                                  cx={`${x}%`}
                                  cy={`${y}%`}
                                  r="3"
                                  fill={selectedStock.change >= 0 ? "#10b981" : "#ef4444"}
                                />
                              );
                            })}
                          </svg>
                          
                          {/* X-axis labels */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                            {chartData.filter((_, index) => index % 4 === 0).map((point, index) => (
                              <span key={index}>{point.time}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Mở cửa</div>
                        <div className="font-semibold text-gray-900">{formatNumber(selectedStock.open)}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Cao nhất</div>
                        <div className="font-semibold text-green-600">{formatNumber(selectedStock.high)}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Thấp nhất</div>
                        <div className="font-semibold text-red-600">{formatNumber(selectedStock.low)}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">KLGD</div>
                        <div className="font-semibold text-gray-900">{formatNumber(selectedStock.volume)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

       {/* Market Data Section - Realtime */}
      <section id="market" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dữ liệu thị trường
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Theo dõi biến động thị trường chứng khoán Việt Nam theo thời gian thực
            </p>
          </div>

          {/* Market Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-2xl p-1 inline-flex">
              {[
                { id: 'hose', name: 'HOSE', count: stockCounts.hose },
                { id: 'hnx', name: 'HNX', count: stockCounts.hnx },
                { id: 'upcom', name: 'UPCOM', count: stockCounts.upcom }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã CK</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Công ty</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thay đổi</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">% Thay đổi</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">KLGD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stocksLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : (
                    stocks.map((stock: StockData) => (
                      <tr 
                        key={stock.symbol} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="font-bold text-gray-900">{stock.symbol}</span>
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {stock.market}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {stock.companyName || 'Công ty cổ phần'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-gray-900">{formatNumber(stock.price)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`flex items-center justify-end font-semibold ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                            {formatNumber(Math.abs(stock.change))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-semibold ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-600">{formatNumber(stock.volume)}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Công cụ và tính năng hỗ trợ nhà đầu tư đưa ra quyết định thông minh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Về StockPro
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                StockPro là nền tảng chứng khoán hàng đầu tại Việt Nam, cung cấp 
                dữ liệu thời gian thực, công cụ phân tích chuyên sâu và thông tin 
                chi tiết về thị trường chứng khoán.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Với đội ngũ chuyên gia giàu kinh nghiệm và công nghệ tiên tiến, 
                chúng tôi cam kết mang đến trải nghiệm đầu tư tốt nhất cho nhà đầu tư.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-bold text-2xl text-gray-900">50K+</div>
                    <div className="text-gray-600">Nhà đầu tư</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="font-bold text-2xl text-gray-900">1,200+</div>
                    <div className="text-gray-600">Mã chứng khoán</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="font-bold text-2xl text-gray-900">24/7</div>
                    <div className="text-gray-600">Hỗ trợ</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PieChart className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-bold text-2xl text-gray-900">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5" />
                  <span>Thứ 2 - Thứ 6: 8:30 - 17:00</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5" />
                  <span>Dữ liệu từ HOSE, HNX, UPCOM</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5" />
                  <span>Thông tin được xác thực</span>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white/10 rounded-xl">
                <h4 className="font-bold mb-4">Cảnh báo rủi ro</h4>
                <p className="text-sm text-blue-100">
                  Đầu tư chứng khoán tiềm ẩn nhiều rủi ro. Quý nhà đầu tư nên tìm hiểu kỹ 
                  trước khi đưa ra quyết định. Hiệu quả đầu tư trong quá khứ không đảm bảo 
                  kết quả trong tương lai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Watchlist Selection Modal */}
      {showWatchlistModal && selectedStockForWatchlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Chọn Watchlist</h3>
            <p className="text-gray-600 mb-4">Thêm {selectedStockForWatchlist.symbol} vào watchlist nào?</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {watchlists?.map((watchlist: Watchlist) => (
                <button
                  key={watchlist.id}
                  onClick={() => {
                    handleAddToWatchlist(selectedStockForWatchlist, watchlist.id);
                    setShowWatchlistModal(false);
                    setSelectedStockForWatchlist(null);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{watchlist.name}</div>
                  <div className="text-sm text-gray-500">
                    {(watchlist.items?.length ?? 0)} mã
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWatchlistModal(false);
                  setSelectedStockForWatchlist(null);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}