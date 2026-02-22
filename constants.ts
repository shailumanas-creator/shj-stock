
import { Condition, ConditionType, Combo } from './types';

export const FUNDAMENTAL_CONDITIONS: Condition[] = [
  { id: 'f1', title: 'ROE (TTM) ≥ 15%', description: 'Consistent high return on equity.', type: ConditionType.FUNDAMENTAL },
  { id: 'f2', title: 'ROCE (TTM) ≥ 15%', description: 'Rising YoY preferred.', type: ConditionType.FUNDAMENTAL },
  { id: 'f3', title: 'Debt/Equity ≤ 0.5', description: 'Net Debt ≤ 0 for debt-free preference.', type: ConditionType.FUNDAMENTAL },
  { id: 'f4', title: 'Interest Coverage ≥ 4', description: 'Ability to service interest comfortably.', type: ConditionType.FUNDAMENTAL },
  { id: 'f5', title: 'Revenue CAGR (3y) ≥ 10%', description: 'Steady top-line growth.', type: ConditionType.FUNDAMENTAL },
  { id: 'f6', title: 'PAT/EPS CAGR (3y) ≥ 10%', description: 'Steady bottom-line growth.', type: ConditionType.FUNDAMENTAL },
  { id: 'f7', title: 'Op. Margin ≥ Industry', description: 'Improving operating efficiency.', type: ConditionType.FUNDAMENTAL },
  { id: 'f8', title: 'Positive FCF (2y)', description: 'FCF margin ≥ 2% preferred.', type: ConditionType.FUNDAMENTAL },
  { id: 'f9', title: 'Positive EPS (4q)', description: 'Consistent quarterly profitability.', type: ConditionType.FUNDAMENTAL },
  { id: 'f10', title: 'PE ≤ 1.5x Sector', description: 'Below 5-yr mean (relative value).', type: ConditionType.FUNDAMENTAL },
  { id: 'f11', title: 'P/B ≤ 3', description: 'Below sector median with rising BV.', type: ConditionType.FUNDAMENTAL },
  { id: 'f12', title: 'Low Pledge (≤ 5%)', description: 'No sudden promoter stake dilution.', type: ConditionType.FUNDAMENTAL },
  { id: 'f13', title: 'Rising Inst. Ownership', description: 'FII/DII increasing stakes (4q).', type: ConditionType.FUNDAMENTAL },
  { id: 'f14', title: 'Div. Yield ≥ 1%', description: 'Steady/growing payout history.', type: ConditionType.FUNDAMENTAL },
  { id: 'f15', title: 'Current Ratio ≥ 1.2', description: 'Improving working capital.', type: ConditionType.FUNDAMENTAL },
  { id: 'f16', title: 'Stable Cash Cycle', description: 'Shortening or stable conversion.', type: ConditionType.FUNDAMENTAL },
  { id: 'f17', title: 'Piotroski Score ≥ 6', description: 'High quality of fundamentals.', type: ConditionType.FUNDAMENTAL },
  { id: 'f18', title: 'Clean Audit Opinion', description: 'No material contingent liabilities.', type: ConditionType.FUNDAMENTAL },
  { id: 'f19', title: 'Sector Strength', description: 'ROE/ROCE > Sector average.', type: ConditionType.FUNDAMENTAL },
  { id: 'f20', title: 'Insider Buying (12m)', description: 'Management confidence indicator.', type: ConditionType.FUNDAMENTAL },
];

export const TECHNICAL_CONDITIONS: Condition[] = [
  { id: 't1', title: 'Price > 200 SMA', description: 'Long-term bullish trend.', type: ConditionType.TECHNICAL },
  { id: 't2', title: 'Golden Crossover', description: 'SMA50 > SMA200 confirmation.', type: ConditionType.TECHNICAL },
  { id: 't3', title: 'Averages Aligned', description: 'SMA20 > SMA50 > SMA200.', type: ConditionType.TECHNICAL },
  { id: 't4', title: '52-Week High Breakout', description: 'Breakout on high volume.', type: ConditionType.TECHNICAL },
  { id: 't5', title: 'SMA20/50 Crossover', description: 'Recent bullish momentum.', type: ConditionType.TECHNICAL },
  { id: 't6', title: 'HH/HL Structure', description: 'Standard bullish price action.', type: ConditionType.TECHNICAL },
  { id: 't7', title: 'MACD Bullish', description: 'Line > Signal and MACD > 0.', type: ConditionType.TECHNICAL },
  { id: 't8', title: 'RSI(14) > 50', description: 'Trending up in 50-70 range.', type: ConditionType.TECHNICAL },
  { id: 't9', title: 'ADX > 25 (+DI > -DI)', description: 'Strong directional trend.', type: ConditionType.TECHNICAL },
  { id: 't10', title: 'Triangle/Cup Breakout', description: 'Pattern breakout with volume.', type: ConditionType.TECHNICAL },
  { id: 't11', title: 'Retest Confirmation', description: 'Holding breakout level support.', type: ConditionType.TECHNICAL },
  { id: 't12', title: 'Vol. > 1.5x Avg', description: 'Volume confirmation on move.', type: ConditionType.TECHNICAL },
  { id: 't13', title: 'Price > 21-EMA', description: 'Short-term trend support.', type: ConditionType.TECHNICAL },
  { id: 't14', title: 'Price > VWAP', description: 'Intraday institutional bias.', type: ConditionType.TECHNICAL },
  { id: 't15', title: 'OBV Breakout', description: 'Volume confirming price move.', type: ConditionType.TECHNICAL },
  { id: 't16', title: 'BB Squeeze Breakout', description: 'Volatility expansion upside.', type: ConditionType.TECHNICAL },
  { id: 't17', title: 'Bullish Divergence', description: 'Resolved RSI/MACD divergence.', type: ConditionType.TECHNICAL },
  { id: 't18', title: 'Weekly SMA50 Break', description: 'Multi-timeframe confirmation.', type: ConditionType.TECHNICAL },
  { id: 't19', title: 'Gap-up Follow-through', description: 'Strength after gap.', type: ConditionType.TECHNICAL },
  { id: 't20', title: 'Bullish Options Flow', description: 'Call OI rising + Price rise.', type: ConditionType.TECHNICAL },
];

export const COMBOS: Combo[] = [
  {
    id: 'a',
    name: 'Combo A: Quality Growth',
    description: 'Conservative approach focusing on stable earnings and long-term trends.',
    fundamentals: ['ROE ≥ 15%', 'ROCE ≥ 15%', 'Debt/Equity ≤ 0.5', 'Revenue CAGR (3y) ≥ 10%', 'Positive FCF'],
    technicals: ['Price > 200 SMA', 'SMA50 > SMA200', 'MACD Crossover', 'Volume > 1.5x'],
    screenerQuery: 'Return on equity > 15 AND Return on capital employed > 15 AND Debt to equity < 0.5 AND Sales growth 3Years > 10 AND Average free cash flow 3years > 0',
    tradingViewFilters: 'Price > 200 SMA, 50 SMA > 200 SMA, MACD Bullish Crossover'
  },
  {
    id: 'b',
    name: 'Combo B: Momentum + Value',
    description: 'Balanced approach capturing strong moves in reasonably valued stocks.',
    fundamentals: ['PE ≤ 1.5x Sector', 'Rising Inst. Ownership', 'Clean Audit'],
    technicals: ['Price > SMA50', 'RSI > 50', 'ADX > 25', '52-Wk High Breakout'],
    screenerQuery: 'Price to Earning < 25 AND Institutional holding > 5 AND Return on capital employed > 12',
    tradingViewFilters: 'Price > 50 SMA, RSI > 50, ADX > 25, Near 52-Wk High'
  },
  {
    id: 'c',
    name: 'Combo C: Short-term Swing',
    description: 'Trader-focused aggressive screen for quick technical reversals.',
    fundamentals: ['Positive EPS last 4q', 'Low Pledge'],
    technicals: ['Price > 21-EMA', 'EMA8 > EMA21', 'Bollinger Squeeze', 'VWAP Support'],
    screenerQuery: 'Net profit > 0 AND Promoter pledging < 5 AND Debt to equity < 1',
    tradingViewFilters: 'Price > 21 EMA, EMA 8 > EMA 21, Bollinger Band Squeeze'
  }
];

export const EXTERNAL_LINKS = [
  { name: 'NSE Live', url: 'https://www.nseindia.com/market-data/live-equity-market', icon: 'fa-chart-line' },
  { name: 'BSE India', url: 'https://www.bseindia.com', icon: 'fa-building' },
  { name: 'TradingView', url: 'https://in.tradingview.com/screener/', icon: 'fa-tv' },
  { name: 'Screener.in', url: 'https://www.screener.in', icon: 'fa-filter' },
  { name: 'Investing.com', url: 'https://in.investing.com/stock-screener', icon: 'fa-globe' },
  { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/stock-scanner/technical/', icon: 'fa-coins' },
  { name: 'Tickertape', url: 'https://www.tickertape.in/screener/equity', icon: 'fa-tape' },
];
