require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 15 minutes — saves API calls
const cache = new NodeCache({ stdTTL: 900 });

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Fetch daily price history for a stock
// symbol examples: 'RELIANCE.BSE', 'HDFCBANK.BSE', 'INFY.BSE'
const fetchStockData = async (symbol) => {
  const cacheKey = `stock_${symbol}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for ${symbol}`);
    return cached;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: 'compact', // last 100 days
        apikey: API_KEY
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    // Convert to array of { date, open, high, low, close, volume }
    const priceHistory = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // oldest to newest

    const result = {
      symbol,
      currentPrice: priceHistory[priceHistory.length - 1].close,
      priceHistory,
      closingPrices: priceHistory.map(d => d.close),
      lastUpdated: new Date().toISOString()
    };

    // Store in cache
    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    throw new Error(`Failed to fetch stock data: ${error.message}`);
  }
};

// Fetch quote — current price only (uses less API quota)
const fetchCurrentPrice = async (symbol) => {
  const cacheKey = `price_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error(`No quote found for: ${symbol}`);
    }

    const result = {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      volume: parseInt(quote['06. volume']),
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    throw new Error(`Failed to fetch price: ${error.message}`);
  }
};

module.exports = { fetchStockData, fetchCurrentPrice };