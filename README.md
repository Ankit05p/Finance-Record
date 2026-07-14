# Finance Dashboard — AI-Powered Financial Management Backend

> A production-grade REST API backend for personal finance management with AI-driven goal planning and multi-layer stock analysis engine.

---

## What This Project Does

Most finance apps are either too complex or too generic. This backend powers a platform specifically built for young professionals and students who want to:

- Track income and expenses with category-wise analytics
- Plan savings goals with AI-generated milestone plans
- Get data-driven stock investment suggestions using real BSE market data
- Receive Buy/Hold/Sell signals powered by technical indicators + news sentiment

---

## Tech Stack

| Category | Technology |
|---|---|
| Backend Framework | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Password Security | Bcrypt |
| AI Model | Groq LLaMA 3.3 70B |
| Market Data | Alpha Vantage API |
| News Sentiment | NewsAPI |
| Technical Analysis | technicalindicators (RSI, MACD, SMA) |
| Caching | node-cache (15 min TTL) |
| Scheduler | node-cron |
| Email Service | Nodemailer |
| OTP Handling | otp-generator |
| Environment Config | dotenv |
| Development Tool | Nodemon |
| API Testing | Postman |
| Version Control | Git, GitHub |

---

## Features

### Core Features
- JWT-based stateless authentication with OTP email verification
- Role-Based Access Control (RBAC) — Admin, Analyst, User
- Financial record management — income and expense tracking
- Category management with budget limits
- Monthly P&L analytics via MongoDB aggregation pipeline
- Recent activity audit trail

### AI Goal Planning Assistant
- User sets a financial goal with target amount and deadline
- Backend calculates average monthly surplus from last 3 months of transaction history
- Feasibility check — required monthly saving vs available surplus
- Groq LLaMA 3.3 70B generates personalized savings plan with milestone timeline
- Automated monthly cron job tracks progress and marks failed goals

### AI Stock Analysis Engine
- Fetches real BSE market data from Alpha Vantage API (last 100 days)
- Calculates RSI, MACD, and SMA technical indicators
- Fetches last 7 days of news headlines from NewsAPI
- Groq LLaMA 3.3 analyzes news sentiment (score 0-100)
- Combines technical score (60%) + sentiment score (40%) = final recommendation
- Returns Buy/Hold/Sell signal with confidence score, price target, and stop-loss level
- Stock scanner categorizes top BSE stocks into Top Buys, Hold, and Avoid
- Stock watchlist for tracking favorite stocks

---

## Project Structure

```
FINANCE RECORD/
│
├── config/
│   └── database.js              # MongoDB connection
│
├── controller/
│   ├── Auth.js                  # Authentication — login, register, OTP
│   ├── CategoryService.js       # Category CRUD
│   ├── FinancialService.js      # Financial record CRUD + analytics
│   ├── GoalService.js           # AI goal planning assistant
│   ├── RecentActivityService.js # Activity audit trail
│   ├── StockService.js          # AI stock analysis engine
│   └── UserService.js           # User management
│
├── middlewares/
│   └── auth.js                  # JWT verification + role guard
│
├── models/
│   ├── Category.js              # Category schema
│   ├── FinancialRecord.js       # Income/expense schema
│   ├── Goal.js                  # Goal schema with milestone sub-documents
│   ├── Otp.js                   # OTP schema
│   ├── RecentActivity.js        # Activity log schema
│   ├── User.js                  # User schema
│   └── WatchList.js             # Stock watchlist schema
│
├── routes/
│   ├── CategoryRoute.js         # Category routes
│   ├── FinancialRoute.js        # Financial record routes
│   ├── GoalRoute.js             # Goal planning routes
│   ├── RecentActivity.js        # Activity routes
│   ├── StockRoute.js            # Stock analysis routes
│   └── UserRoute.js             # User routes
│
├── utils/
│   ├── aiHelper.js              # Groq LLaMA prompts — goal + stock analysis
│   ├── GoalCron.js              # Monthly cron job for goal tracking
│   ├── mailSender.js            # Email/OTP utility
│   ├── sentimentHelper.js       # NewsAPI + Groq sentiment analysis
│   ├── stockHelper.js           # Alpha Vantage API + node-cache
│   └── technicalHelper.js       # RSI, MACD, SMA calculation + scoring
│
├── .env                         # Environment variables (not committed)
├── index.js                     # Entry point
├── package.json
└── package-lock.json
```

---

## Setup Guide

### Step 1 — Clone the repository
```bash
git clone https://github.com/Ankit05p/Finance-Record.git
cd Finance-Record
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Configure environment variables

Create a `.env` file in root directory:

```env
PORT=4000

DATABASE_URL=your_mongodb_atlas_url

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

JWT_SECRET=your_jwt_secret_key

GROQ_API_KEY=your_groq_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_newsapi_key
```

### Step 4 — Get free API keys

| Service | URL | Free Tier |
|---|---|---|
| Groq (AI) | console.groq.com | 100k tokens/day |
| Alpha Vantage | alphavantage.co | 25 calls/day |
| NewsAPI | newsapi.org | 100 calls/day |

### Step 5 — Start development server
```bash
npm run dev
```

Server runs at `http://localhost:4000`

---

## API Reference

Base URL: `http://localhost:4000`

---

### Auth Routes `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /auth/sendotp | Send OTP for signup | No |
| POST | /auth/signup | Register new user | No |
| POST | /auth/login | Login user | No |
| POST | /auth/changePassword | Change password | Yes |
| POST | /auth/logout | Logout user | Yes |
| GET | /auth/getAllUsers | Get all users | Yes |
| GET | /auth/getUserById/:id | Get user by ID | Yes |
| PUT | /auth/updateUser/:id | Update user | Yes |
| DELETE | /auth/deleteUser/:id | Delete user | Yes |

---

### Category Routes `/api/v1/category`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /category/createCategory | Create new category | Yes |
| GET | /category/showAllCategory | Get all categories | Yes |
| GET | /category/categoryPageDetails/:id | Get category details | Yes |

---

### Financial Routes `/api/v1/finance`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /finance/createFinancialRecore | Create financial record | Yes |
| GET | /finance/getAllFinanceRecore | Get all records | Yes |
| GET | /finance/getFinanceByUserId/:id | Get records by user | Yes |
| POST | /finance/updateFinancialRecore | Update record | Yes |
| POST | /finance/deleteFinancialRecord | Delete record | Yes |

---

### Goal Routes `/api/v1/goals`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /goals/createGoal | Create goal with AI plan | Yes |
| GET | /goals/getAllGoals | Get all user goals | Yes |
| GET | /goals/getGoalById/:id | Get single goal | Yes |
| PATCH | /goals/addSavingToGoal/:id/save | Add saving amount | Yes |
| GET | /goals/getProgress/:id/progress | Get AI progress update | Yes |
| DELETE | /goals/deleteGoal/:id | Delete goal | Yes |

---

### Stock Routes `/api/v1/stocks`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /stocks/price/:symbol | Get live stock price | No |
| GET | /stocks/analyze/:symbol | Full AI analysis | No |
| GET | /stocks/top-picks | Top Buy/Hold/Avoid picks | No |

**Examples:**
```
GET /api/v1/stocks/analyze/TCS.BSE?horizon=weekly
GET /api/v1/stocks/top-picks?horizon=monthly
GET /api/v1/stocks/price/RELIANCE.BSE
```

---

### Recent Activity Routes `/api/v1/recent`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /recent/getAllRecentActivity | Get all activities | Yes |
| GET | /recent/ActivityOfUserById/:id | Get activity by user | Yes |

---

## Role Permissions

| Feature | User | Analyst | Admin |
|---|---|---|---|
| View all users | ✓ | ✓ | ✓ |
| View user by ID | Self only | ✓ | ✓ |
| Update user | Self only | ✓ | ✓ |
| Delete user | Self only | ✓ | ✓ |
| Create category | ✗ | ✓ | ✓ |
| View categories | ✓ | ✓ | ✓ |
| Create financial record | Self only | ✓ | ✓ |
| View all financial records | ✗ | ✓ | ✓ |
| View own financial records | ✓ | ✓ | ✓ |
| Update financial record | Self only | ✓ | ✓ |
| Delete financial record | Self only | ✓ | ✓ |
| Create/manage goals | Self only | ✓ | ✓ |
| View activity logs | Self only | ✓ | ✓ |
| Stock analysis | ✓ | ✓ | ✓ |
| Change password | ✓ | ✓ | ✓ |

---

## Stock Analysis — How It Works

```
User requests analysis for TCS.BSE
            ↓
Alpha Vantage API — fetch 100 days OHLCV data
            ↓
Technical Analysis (technicalindicators)
  RSI (14-day)   → overbought/oversold signal
  MACD (12-26-9) → momentum crossover signal
  SMA (20-day)   → trend direction signal
  → Technical Score: 0-100
            ↓
NewsAPI — fetch last 7 days headlines
            ↓
Groq LLaMA 3.3 — sentiment analysis
  → Sentiment Score: 0-100
  → Label: VERY_POSITIVE / POSITIVE / NEUTRAL / NEGATIVE
            ↓
Score Aggregator
  Final Score = (Technical × 60%) + (Sentiment × 40%)
            ↓
Groq LLaMA 3.3 — combined AI analysis
            ↓
Final Output:
  Signal: BUY / HOLD / SELL
  Confidence: 72%
  Price Target: ₹2,302
  Stop Loss: ₹1,988
  Risk Level: MEDIUM
```

---

## Goal Planner — How It Works

```
User creates goal: "Buy bike — ₹1,80,000 in 12 months"
            ↓
MongoDB aggregation pipeline
  → avgMonthlyIncome (last 3 months)
  → avgMonthlyExpense (last 3 months)
  → surplus = income - expense
            ↓
Feasibility check
  requiredMonthlySaving = targetAmount / monthsLeft
  isFeasible = surplus >= required
            ↓
Groq LLaMA 3.3 — personalized plan
  → summary, feasibilityNote, tips[]
  → milestones[] with monthly targets
            ↓
Stored in Goal collection
Monthly cron job (1st of every month)
  → updates progressPercent
  → marks achieved milestones
  → sets status "failed" if deadline passed
```

---

<!-- ## Challenges Solved

- **JWT field mismatch** — token payload had `id` but controllers accessed `_id` — fixed with bulk replace
- **Alpha Vantage rate limiting** — 5 calls/minute caused silent failures — fixed with 15-second throttling and node-cache
- **AI response parsing** — Groq occasionally wraps JSON in markdown fences — fixed with cleaning layer before JSON.parse()
- **API quota failures** — OpenAI and Gemini quota issues — migrated to Groq free tier (100k tokens/day)
- **CommonJS vs ES Modules** — mixed syntax crashed server — standardized entire codebase to CommonJS

--- -->

## Error Responses

| Scenario | Status | Message |
|---|---|---|
| Missing/invalid token | 401 | Access denied. No token provided. |
| Token expired | 401 | Token expired. Please refresh. |
| Insufficient role | 403 | Access denied. Required role: admin |
| Not found | 404 | Resource not found |
| Validation failure | 400 | Validation failed + field details |
| Duplicate email | 409 | Email already exists |
| Server error | 500 | Internal Server Error |

---

## API Testing

All APIs can be tested using Postman.

🔗 [Open Postman Collection](https://go.postman.co/collection/46701484-dc47e39d-43ac-4701-9726-ea6d1fc41887?source=collection_link)

### Authorization header for protected routes:
```
Authorization: Bearer your_jwt_token
```

---

## Author

**Ankit Patel**
B.E. Electronics & Telecommunication — IET DAVV, Indore
GitHub: [@Ankit05p](https://github.com/Ankit05p)