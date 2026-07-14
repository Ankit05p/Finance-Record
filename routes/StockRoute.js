const express = require('express');
const {
  analyzeStock,
  getTopPicks,
  getStockPrice,
  addToWatchList,
  getWatchList,
  removeFromWatchList
} = require('../controller/StockService');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Public routes — no auth needed
router.get('/price/:symbol', getStockPrice);

// Protected routes — auth required
router.use(auth);
router.get('/analyze/:symbol', analyzeStock);
router.get('/top-picks', getTopPicks);
router.post('/watchlist', addToWatchList);
router.get('/watchlist', getWatchList);
router.delete('/watchlist/:id', removeFromWatchList);

module.exports = router;