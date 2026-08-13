import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StockQuote, IndexQuote, PortfolioPosition, TradeRecord, TradingMode } from '../types/stock';

const DEFAULT_WATCHLIST = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL',
  'INFY', 'SBIN', 'TATAMOTORS', 'LT', 'ITC', 'ZOMATO', 'TATAPOWER', 'MARUTI', 'BAJFINANCE'
];

const INITIAL_INDICES: IndexQuote[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', price: 24350.25, change: 185.40, change_percent: 0.77, high: 24410.00, low: 24190.00, open: 24200.00, sparkline: [24200, 24230, 24190, 24280, 24310, 24350.25] },
  { symbol: 'SENSEX', name: 'BSE SENSEX', price: 79840.10, change: 540.20, change_percent: 0.68, high: 80010.00, low: 79380.00, open: 79400.00, sparkline: [79400, 79520, 79380, 79650, 79800, 79840.10] },
  { symbol: 'NIFTY BANK', name: 'NIFTY BANK', price: 52180.50, change: 420.80, change_percent: 0.81, high: 52350.00, low: 51800.00, open: 51850.00, sparkline: [51850, 51920, 51800, 52050, 52110, 52180.50] },
  { symbol: 'NIFTY IT', name: 'NIFTY IT', price: 41250.75, change: -120.30, change_percent: -0.29, high: 41600.00, low: 41100.00, open: 41500.00, sparkline: [41500, 41480, 41600, 41320, 41100, 41250.75] },
  { symbol: 'NIFTY MIDCAP', name: 'NIFTY MIDCAP 100', price: 58240.30, change: 615.10, change_percent: 1.07, high: 58390.00, low: 57700.00, open: 57750.00, sparkline: [57750, 57890, 57700, 58020, 58150, 58240.30] }
];

interface TraderState {
  // Navigation & Selection
  selectedTicker: string;
  tradingMode: TradingMode;
  searchModalOpen: boolean;
  
  // Market Data
  indices: IndexQuote[];
  stocks: StockQuote[];
  
  // User Watchlist & Portfolio
  watchlist: string[];
  cashBalance: number;
  positions: PortfolioPosition[];
  tradeHistory: TradeRecord[];
  
  // Actions
  setSelectedTicker: (ticker: string) => void;
  setTradingMode: (mode: TradingMode) => void;
  setSearchModalOpen: (open: boolean) => void;
  setStocks: (stocks: StockQuote[]) => void;
  updateIndices: (indices: IndexQuote[]) => void;
  
  // Watchlist Actions
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  
  // Paper Trading Actions
  executeTrade: (ticker: string, name: string, type: 'BUY' | 'SELL', quantity: number, price: number) => { success: boolean; message: string };
  resetPortfolio: () => void;
}

export const useTraderStore = create<TraderState>()(
  persist(
    (set, get) => ({
      selectedTicker: 'RELIANCE',
      tradingMode: 'intraday',
      searchModalOpen: false,
      
      indices: INITIAL_INDICES,
      stocks: [],
      
      watchlist: DEFAULT_WATCHLIST,
      cashBalance: 1000000, // ₹10 Lakh Initial Virtual Cash
      positions: [
        {
          id: 'pos_1',
          ticker: 'RELIANCE',
          name: 'Reliance Industries Ltd',
          quantity: 25,
          avgPrice: 2950.00,
          currentPrice: 2985.40,
          totalCost: 73750,
          currentValue: 74635,
          unrealizedPnL: 885,
          unrealizedPnLPercent: 1.20,
          type: 'BUY',
          mode: 'intraday',
          date: new Date().toISOString()
        },
        {
          id: 'pos_2',
          ticker: 'TCS',
          name: 'Tata Consultancy Services Ltd',
          quantity: 10,
          avgPrice: 4120.00,
          currentPrice: 4180.20,
          totalCost: 41200,
          currentValue: 41802,
          unrealizedPnL: 602,
          unrealizedPnLPercent: 1.46,
          type: 'BUY',
          mode: 'long-term',
          date: new Date().toISOString()
        }
      ],
      tradeHistory: [
        {
          id: 'trd_1',
          ticker: 'RELIANCE',
          type: 'BUY',
          quantity: 25,
          price: 2950.00,
          totalAmount: 73750,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          mode: 'intraday'
        },
        {
          id: 'trd_2',
          ticker: 'TCS',
          type: 'BUY',
          quantity: 10,
          price: 4120.00,
          totalAmount: 41200,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          mode: 'long-term'
        }
      ],
      
      setSelectedTicker: (ticker) => set({ selectedTicker: ticker.toUpperCase().trim() }),
      setTradingMode: (mode) => set({ tradingMode: mode }),
      setSearchModalOpen: (open) => set({ searchModalOpen: open }),
      setStocks: (stocks) => set({ stocks }),
      updateIndices: (indices) => set({ indices }),
      
      addToWatchlist: (ticker) => {
        const uppercase = ticker.toUpperCase().trim();
        const current = get().watchlist;
        if (!current.includes(uppercase)) {
          set({ watchlist: [uppercase, ...current] });
        }
      },
      
      removeFromWatchlist: (ticker) => {
        const uppercase = ticker.toUpperCase().trim();
        set({ watchlist: get().watchlist.filter(t => t !== uppercase) });
      },
      
      isInWatchlist: (ticker) => {
        return get().watchlist.includes(ticker.toUpperCase().trim());
      },
      
      executeTrade: (ticker, name, type, quantity, price) => {
        const { cashBalance, positions, tradeHistory, tradingMode } = get();
        const uppercase = ticker.toUpperCase().trim();
        const totalAmount = quantity * price;
        
        if (type === 'BUY') {
          if (totalAmount > cashBalance) {
            return { success: false, message: `Insufficient Virtual Balance! Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${cashBalance.toLocaleString('en-IN')}` };
          }
          
          // Deduct Cash
          const newCash = cashBalance - totalAmount;
          
          // Check existing position
          const existingIdx = positions.findIndex(p => p.ticker === uppercase && p.mode === tradingMode);
          let newPositions = [...positions];
          
          if (existingIdx >= 0) {
            const pos = newPositions[existingIdx];
            const newQty = pos.quantity + quantity;
            const newTotalCost = pos.totalCost + totalAmount;
            const newAvg = newTotalCost / newQty;
            const currVal = newQty * price;
            const pnl = currVal - newTotalCost;
            
            newPositions[existingIdx] = {
              ...pos,
              quantity: newQty,
              avgPrice: Math.round(newAvg * 100) / 100,
              totalCost: newTotalCost,
              currentPrice: price,
              currentValue: currVal,
              unrealizedPnL: Math.round(pnl * 100) / 100,
              unrealizedPnLPercent: Math.round((pnl / newTotalCost) * 10000) / 100
            };
          } else {
            newPositions.unshift({
              id: `pos_${Date.now()}`,
              ticker: uppercase,
              name,
              quantity,
              avgPrice: price,
              currentPrice: price,
              totalCost: totalAmount,
              currentValue: totalAmount,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
              type: 'BUY',
              mode: tradingMode,
              date: new Date().toISOString()
            });
          }
          
          // Add Trade Record
          const newHistory: TradeRecord[] = [
            {
              id: `trd_${Date.now()}`,
              ticker: uppercase,
              type: 'BUY',
              quantity,
              price,
              totalAmount,
              timestamp: new Date().toISOString(),
              mode: tradingMode
            },
            ...tradeHistory
          ];
          
          set({ cashBalance: newCash, positions: newPositions, tradeHistory: newHistory });
          return { success: true, message: `Successfully bought ${quantity} shares of ${uppercase} at ₹${price}!` };
        } else {
          // SELL logic
          const existingIdx = positions.findIndex(p => p.ticker === uppercase && p.mode === tradingMode);
          if (existingIdx < 0 || positions[existingIdx].quantity < quantity) {
            const availableQty = existingIdx >= 0 ? positions[existingIdx].quantity : 0;
            return { success: false, message: `Cannot sell ${quantity} shares! Available holding in ${tradingMode} mode: ${availableQty}` };
          }
          
          const pos = positions[existingIdx];
          const saleVal = quantity * price;
          const costOfSharesSold = pos.avgPrice * quantity;
          const realizedPnL = saleVal - costOfSharesSold;
          const newCash = cashBalance + saleVal;
          
          let newPositions = [...positions];
          if (pos.quantity === quantity) {
            // Closed position completely
            newPositions = newPositions.filter((_, idx) => idx !== existingIdx);
          } else {
            const remQty = pos.quantity - quantity;
            const remCost = pos.avgPrice * remQty;
            const currVal = remQty * price;
            const pnl = currVal - remCost;
            
            newPositions[existingIdx] = {
              ...pos,
              quantity: remQty,
              totalCost: remCost,
              currentPrice: price,
              currentValue: currVal,
              unrealizedPnL: Math.round(pnl * 100) / 100,
              unrealizedPnLPercent: Math.round((pnl / remCost) * 10000) / 100
            };
          }
          
          const newHistory: TradeRecord[] = [
            {
              id: `trd_${Date.now()}`,
              ticker: uppercase,
              type: 'SELL',
              quantity,
              price,
              totalAmount: saleVal,
              timestamp: new Date().toISOString(),
              mode: tradingMode
            },
            ...tradeHistory
          ];
          
          set({ cashBalance: newCash, positions: newPositions, tradeHistory: newHistory });
          return { success: true, message: `Successfully sold ${quantity} shares of ${uppercase} at ₹${price}! Realized P&L: ₹${Math.round(realizedPnL).toLocaleString('en-IN')}` };
        }
      },
      
      resetPortfolio: () => set({
        cashBalance: 1000000,
        positions: [],
        tradeHistory: []
      })
    }),
    {
      name: 'ai-trader-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        cashBalance: state.cashBalance,
        positions: state.positions,
        tradeHistory: state.tradeHistory,
        tradingMode: state.tradingMode
      })
    }
  )
);
