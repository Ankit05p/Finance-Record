require('dotenv').config();
const { fetchStockData, fetchCurrentPrice } = require('../utils/stockHelper');
const { analyzeTechnicals, calculateRiskReward } = require('../utils/technicalHelper');
const WatchList = require('../models/WatchList');
const { getStockSentiment } = require('../utils/sentimentHelper');
const { generateStockAnalysis, generateCombinedAnalysis } = require('../utils/aiHelper');

// Popular Indian stocks list
const POPULAR_STOCKS = [
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries' },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank' },
  { symbol: 'INFY.BSE', name: 'Infosys' },
  { symbol: 'TCS.BSE', name: 'TCS' },
  { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank' },
  { symbol: 'WIPRO.BSE', name: 'Wipro' },
  { symbol: 'SBIN.BSE', name: 'State Bank of India' },
  { symbol: 'TATAMOTORS.BSE', name: 'Tata Motors' }
];

// GET /api/v1/stocks/analyze/:symbol
// Full analysis — technical + AI
// const analyzeStock = async (req, res) => {
//   try {
//     const { symbol } = req.params;
//     const { horizon = 'weekly' } = req.query;
//     // horizon options: 'intraday', 'weekly', 'monthly'

//     // Step 1 — Fetch real market data
    
//     const stockData = await fetchStockData(symbol.toUpperCase());

//     // Step 2 — Technical analysis
//     const technical = analyzeTechnicals(stockData.closingPrices);

//     if (technical.signal === 'INSUFFICIENT_DATA') {
//       return res.status(400).json({
//         success: false,
//         message: 'Not enough historical data for this stock'
//       });
//     }

//     // Step 3 — Risk/reward calculation
//     const riskReward = calculateRiskReward(
//       stockData.currentPrice,
//       technical.signal
//     );

//     // Step 4 — AI analysis
//     const company = POPULAR_STOCKS.find(s => s.symbol === symbol.toUpperCase());
//     const aiAnalysis = await generateStockAnalysis({
//       symbol,
//       companyName: company?.name || symbol,
//       currentPrice: stockData.currentPrice,
//       technicalSignal: technical.signal,
//       rsi: technical.rsi,
//       macd: technical.macd,
//       reasons: technical.reasons,
//       horizon
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         symbol,
//         companyName: company?.name || symbol,
//         currentPrice: stockData.currentPrice,
//         lastUpdated: stockData.lastUpdated,
//         technical: {
//           signal: technical.signal,
//           confidence: technical.confidence,
//           rsi: technical.rsi,
//           macd: technical.macd,
//           sma: technical.sma,
//           reasons: technical.reasons
//         },
//         riskReward,
//         aiAnalysis,
//         priceHistory: stockData.priceHistory.slice(-30) // last 30 days for chart
//       }
//     });

//   } catch (error) {
//     console.error('analyzeStock error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Analysis failed',
//       error: error.message
//     });
//   }
// };

// Add these imports at top of StockService.js

const analyzeStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { horizon = 'weekly' } = req.query;

    // Step 1 — Fetch real market data
    const stockData = await fetchStockData(symbol.toUpperCase());

    // Step 2 — Technical analysis
    const technical = analyzeTechnicals(stockData.closingPrices);

    if (technical.signal === 'INSUFFICIENT_DATA') {
      return res.status(400).json({
        success: false,
        message: 'Not enough historical data for this stock'
      });
    }

    // Step 3 — Risk/reward calculation
    const riskReward = calculateRiskReward(
      stockData.currentPrice,
      technical.signal
    );

    // Step 4 — Company info
    const company = POPULAR_STOCKS.find(s => s.symbol === symbol.toUpperCase());
    const companyName = company?.name || symbol;

    // Step 5 — News sentiment (NEW)
    const sentimentData = await getStockSentiment(companyName);

    // Step 6 — Combined AI analysis (NEW)
    const combinedAnalysis = await generateCombinedAnalysis({
      symbol,
      companyName,
      currentPrice: stockData.currentPrice,
      technicalSignal: technical.signal,
      technicalScore: technical.confidence,
      technicalReasons: technical.reasons,
      sentimentScore: sentimentData.sentiment.score,
      sentimentLabel: sentimentData.sentiment.label,
      sentimentSummary: sentimentData.sentiment.summary,
      horizon
    });

    return res.status(200).json({
      success: true,
      data: {
        symbol,
        companyName,
        currentPrice: stockData.currentPrice,
        lastUpdated: stockData.lastUpdated,

        // Layer 1 — Technical
        technical: {
          signal: technical.signal,
          confidence: technical.confidence,
          rsi: technical.rsi,
          macd: technical.macd,
          sma: technical.sma,
          reasons: technical.reasons
        },

        // Layer 2 — Sentiment (NEW)
        sentiment: {
          score: sentimentData.sentiment.score,
          label: sentimentData.sentiment.label,
          summary: sentimentData.sentiment.summary,
          keyInsight: sentimentData.sentiment.keyInsight,
          headlines: sentimentData.headlines
        },

        // Layer 3 — Combined AI (NEW)
        combinedAnalysis,

        riskReward,
        priceHistory: stockData.priceHistory.slice(-30)
      }
    });

  } catch (error) {
    console.error('analyzeStock error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Analysis failed',
      error: error.message
    });
  }
};

// GET /api/v1/stocks/top-picks?horizon=weekly
// Scan popular stocks and return top 3 picks
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getTopPicks = async (req, res) => {
  try {
    const { horizon = 'weekly' } = req.query;
    const results = [];

    const stocksToScan = POPULAR_STOCKS.slice(0, 4);

    for (const stock of stocksToScan) {
      try {
        const stockData = await fetchStockData(stock.symbol);
        const technical = analyzeTechnicals(stockData.closingPrices);

        if (technical.signal !== 'INSUFFICIENT_DATA') {
          const riskReward = calculateRiskReward(
            stockData.currentPrice,
            technical.signal
          );

          results.push({
            symbol: stock.symbol,
            companyName: stock.name,
            currentPrice: stockData.currentPrice,
            signal: technical.signal,
            confidence: technical.confidence,
            rsi: technical.rsi,
            target: riskReward.target,
            stopLoss: riskReward.stopLoss
          });
        }
      } catch (err) {
        console.log(`Skipping ${stock.symbol}: ${err.message}`);
      }

      await delay(15000);
    }

    results.sort((a, b) => b.confidence - a.confidence);

    // 3 separate categories
    const topBuys = results
      .filter(r => r.signal === 'BUY')
      .slice(0, 3);

    const topHold = results
      .filter(r => r.signal === 'HOLD')
      .slice(0, 3);

    const topAvoid = results
      .filter(r => r.signal === 'SELL')
      .slice(0, 2);

    return res.status(200).json({
      success: true,
      data: {
        horizon,
        topBuys,
        topHold,
        topAvoid,
        scannedAt: new Date().toISOString(),
        totalScanned: results.length
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get top picks',
      error: error.message
    });
  }
};

// GET /api/v1/stocks/price/:symbol — quick price check
const getStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await fetchCurrentPrice(symbol.toUpperCase());
    return res.status(200).json({ success: true, data: quote });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/v1/stocks/watchlist — add stock to watchlist
const addToWatchList = async (req, res) => {
  try {
    const { symbol, companyName, notes } = req.body;
    const userId = req.user.id;

    const existing = await WatchList.findOne({ user: userId, symbol });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Stock already in watchlist'
      });
    }

    const item = await WatchList.create({
      user: userId,
      symbol: symbol.toUpperCase(),
      companyName,
      notes
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/v1/stocks/watchlist — get user's watchlist with live prices
const getWatchList = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await WatchList.find({ user: userId });

    // Fetch current price for each stock
    const withPrices = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const quote = await fetchCurrentPrice(item.symbol);
          return {
            ...item.toObject(),
            currentPrice: quote.price,
            change: quote.change,
            changePercent: quote.changePercent
          };
        } catch {
          return { ...item.toObject(), currentPrice: null };
        }
      })
    );

    return res.status(200).json({ success: true, data: withPrices });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/v1/stocks/watchlist/:id
const removeFromWatchList = async (req, res) => {
  try {
    const item = await WatchList.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.status(200).json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeStock,
  getTopPicks,
  getStockPrice,
  addToWatchList,
  getWatchList,
  removeFromWatchList
};