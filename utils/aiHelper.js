require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateGoalPlan = async ({
  goalName,
  targetAmount,
  deadline,
  currentBalance,
  monthlySurplus,
  requiredMonthlySaving,
  isFeasible,
  existingGoals,
}) => {
  const monthsLeft = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
  );

  const prompt = `
You are a personal finance advisor. A user wants to achieve a financial goal.

User's financial snapshot:
- Goal: "${goalName}"
- Target amount: Rs.${targetAmount}
- Deadline: ${new Date(deadline).toDateString()} (${monthsLeft} months away)
- Current savings/balance: Rs.${currentBalance}
- Monthly investable surplus: Rs.${monthlySurplus}
- Required monthly saving for this goal: Rs.${requiredMonthlySaving}
- Is this goal feasible? ${isFeasible ? "Yes" : "No — surplus is insufficient"}
- Other active goals: ${existingGoals.length > 0 ? existingGoals.join(", ") : "None"}

Respond ONLY in this exact JSON format, no extra text, no markdown, no code blocks:
{
  "summary": "2-3 sentence personalized advice about this goal",
  "feasibilityNote": "one sentence about whether this is achievable or needs adjustment",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "milestones": [
    { "month": 1, "targetSaved": 5000, "description": "Complete first month saving" }
  ]
}

Generate milestones for every 1-2 months up to the deadline.
Keep language simple and motivating. All amounts in Indian Rupees.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a financial advisor. Always respond in valid JSON only. No markdown, no code blocks, no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

const generateProgressUpdate = async ({
  goalName,
  targetAmount,
  currentSaved,
  progressPercent,
  monthsLeft,
  monthlySurplus,
}) => {
  const prompt = `
A user is tracking their savings goal. Give a short motivating progress update.

Goal: "${goalName}" — Rs.${targetAmount} total
Progress: Rs.${currentSaved} saved (${progressPercent}%)
Months remaining: ${monthsLeft}
Monthly surplus available: Rs.${monthlySurplus}

Respond ONLY in this exact JSON format, no extra text, no markdown, no code blocks:
{
  "message": "2 sentence motivating update",
  "onTrack": true,
  "suggestion": "one specific actionable tip"
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a financial advisor. Always respond in valid JSON only. No markdown, no code blocks, no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_tokens: 300,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

const generateStockAnalysis = async ({
  symbol,
  companyName,
  currentPrice,
  technicalSignal,
  rsi,
  macd,
  reasons,
  horizon // 'intraday', 'weekly', 'monthly'
}) => {
  const prompt = `
You are an expert stock market analyst. Analyze this stock and give investment advice.

Stock: ${companyName} (${symbol})
Current Price: ₹${currentPrice}
Time Horizon: ${horizon}

Technical Analysis Results:
- RSI: ${rsi}
- MACD: ${macd}
- Overall Technical Signal: ${technicalSignal}
- Key observations: ${reasons.join(', ')}

Based on this technical data, provide analysis in ONLY this exact JSON format, no extra text:
{
  "recommendation": "BUY or SELL or HOLD",
  "confidence": 75,
  "summary": "2 sentence analysis of this stock",
  "reasoning": "Why this recommendation based on the technical data",
  "risks": "Main risk for this trade",
  "bestFor": "What type of investor this suits",
  "priceOutlook": "Short price movement expectation"
}

Keep language simple. Be honest about risks. Confidence should match the technical signal strength.
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a stock market analyst. Always respond in valid JSON only. No markdown, no extra text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3, // lower = more consistent output
    max_tokens: 500
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

const generateCombinedAnalysis = async ({
  symbol,
  companyName,
  currentPrice,
  technicalSignal,
  technicalScore,
  technicalReasons,
  sentimentScore,
  sentimentLabel,
  sentimentSummary,
  horizon
}) => {
  // Weighted final score — Technical 60% + Sentiment 40%
  const finalScore = Math.round(
    (technicalScore * 0.6) + (sentimentScore * 0.4)
  );

  const finalSignal = finalScore >= 60 ? 'BUY'
    : finalScore <= 40 ? 'SELL'
      : 'HOLD';

  const prompt = `
You are an expert stock market analyst combining technical and sentiment analysis.

Stock: ${companyName} (${symbol})
Current Price: Rs.${currentPrice}
Time Horizon: ${horizon}

Technical Analysis:
- Signal: ${technicalSignal}
- Score: ${technicalScore}/100
- Key observations: ${technicalReasons.join(', ')}

News Sentiment:
- Label: ${sentimentLabel}
- Score: ${sentimentScore}/100
- Summary: ${sentimentSummary}

Combined Score: ${finalScore}/100
Final Signal: ${finalSignal}

Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "finalRecommendation": "${finalSignal}",
  "finalScore": ${finalScore},
  "summary": "3 sentence complete analysis combining both technical and sentiment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "bestFor": "Type of investor this suits — conservative/moderate/aggressive",
  "horizon": "${horizon}",
  "riskLevel": "LOW or MEDIUM or HIGH"
}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a stock analyst. Respond in valid JSON only. No markdown, no extra text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 600
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

// Add to module.exports
// Change your existing exports line to include this:
module.exports = {
  generateGoalPlan,
  generateProgressUpdate,
  generateStockAnalysis,
  generateCombinedAnalysis
};
