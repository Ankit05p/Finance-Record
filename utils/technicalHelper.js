const {
  RSI,
  MACD,
  SMA,
  BollingerBands
} = require('technicalindicators');

// Input: array of closing prices (last 50 days)
// Output: { signal, rsi, macd, sma, confidence }

const analyzeTechnicals = (closingPrices) => {
  if (closingPrices.length < 26) {
    return { signal: 'INSUFFICIENT_DATA', confidence: 0 };
  }

  // RSI Calculation — 14 day period standard
  const rsiValues = RSI.calculate({
    values: closingPrices,
    period: 14
  });
  const currentRSI = rsiValues[rsiValues.length - 1];

  // MACD Calculation — standard 12,26,9
  const macdValues = MACD.calculate({
    values: closingPrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const currentMACD = macdValues[macdValues.length - 1];
  const prevMACD = macdValues[macdValues.length - 2];

  // Simple Moving Average — 20 day
  const smaValues = SMA.calculate({
    values: closingPrices,
    period: 20
  });
  const currentSMA = smaValues[smaValues.length - 1];
  const currentPrice = closingPrices[closingPrices.length - 1];

  // Score system — 0 to 100
  let score = 50; // neutral start
  let reasons = [];

  // RSI scoring
  if (currentRSI < 30) {
    score += 20;
    reasons.push(`RSI ${currentRSI.toFixed(1)} — oversold, strong buy signal`);
  } else if (currentRSI < 45) {
    score += 10;
    reasons.push(`RSI ${currentRSI.toFixed(1)} — slightly oversold`);
  } else if (currentRSI > 70) {
    score -= 20;
    reasons.push(`RSI ${currentRSI.toFixed(1)} — overbought, sell signal`);
  } else if (currentRSI > 55) {
    score -= 10;
    reasons.push(`RSI ${currentRSI.toFixed(1)} — slightly overbought`);
  } else {
    reasons.push(`RSI ${currentRSI.toFixed(1)} — neutral zone`);
  }

  // MACD scoring — crossover detection
  if (currentMACD && prevMACD) {
    const currentHistogram = currentMACD.histogram;
    const prevHistogram = prevMACD.histogram;

    if (prevHistogram < 0 && currentHistogram > 0) {
      score += 20;
      reasons.push('MACD bullish crossover — strong buy signal');
    } else if (prevHistogram > 0 && currentHistogram < 0) {
      score -= 20;
      reasons.push('MACD bearish crossover — strong sell signal');
    } else if (currentHistogram > 0) {
      score += 10;
      reasons.push('MACD positive — bullish momentum');
    } else {
      score -= 10;
      reasons.push('MACD negative — bearish momentum');
    }
  }

  // Price vs SMA scoring
  if (currentPrice > currentSMA * 1.02) {
    score += 10;
    reasons.push(`Price above 20-day SMA — uptrend`);
  } else if (currentPrice < currentSMA * 0.98) {
    score -= 10;
    reasons.push(`Price below 20-day SMA — downtrend`);
  }

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));

  // Final signal
  let signal;
  if (score >= 65) signal = 'BUY';
  else if (score <= 35) signal = 'SELL';
  else signal = 'HOLD';

  return {
    signal,
    confidence: score,
    rsi: currentRSI?.toFixed(2),
    macd: currentMACD?.MACD?.toFixed(2),
    sma: currentSMA?.toFixed(2),
    currentPrice: currentPrice?.toFixed(2),
    reasons
  };
};

// Calculate stop loss and target price
const calculateRiskReward = (currentPrice, signal, riskPercent = 5) => {
  const stopLoss = signal === 'BUY'
    ? (currentPrice * (1 - riskPercent / 100)).toFixed(2)  // neeche
    : (currentPrice * (1 + riskPercent / 100)).toFixed(2); // upar

  const target = signal === 'BUY'
    ? (currentPrice * (1 + (riskPercent * 2) / 100)).toFixed(2)  // upar
    : (currentPrice * (1 - (riskPercent * 2) / 100)).toFixed(2); // neeche

  return {
    stopLoss: parseFloat(stopLoss),
    target: parseFloat(target),
    riskRewardRatio: '1:2'
  };
};

module.exports = { analyzeTechnicals, calculateRiskReward };