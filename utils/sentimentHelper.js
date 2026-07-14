require('dotenv').config();
const NewsAPI = require('newsapi');
const Groq = require('groq-sdk');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fetch news for a company
const fetchStockNews = async (companyName) => {
  try {
    const response = await newsapi.v2.everything({
      q: companyName,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 5,
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    });

    if (!response.articles || response.articles.length === 0) {
      return { headlines: [], source: 'none' };
    }

    const headlines = response.articles.map(a => a.title).filter(Boolean);
    return { headlines, source: 'newsapi' };

  } catch (error) {
    console.error('News fetch error:', error.message);
    return { headlines: [], source: 'error' };
  }
};

// Analyze sentiment using Groq
const analyzeSentiment = async (companyName, headlines) => {
  if (headlines.length === 0) {
    return {
      score: 50,
      label: 'NEUTRAL',
      summary: 'No recent news found',
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      keyInsight: 'N/A'
    };
  }

  const prompt = `
You are a financial news sentiment analyzer.

Company: ${companyName}
Recent news headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Analyze the sentiment of these headlines for investment purposes.

Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "score": 65,
  "label": "POSITIVE",
  "summary": "2 sentence summary of overall news sentiment",
  "positiveCount": 3,
  "negativeCount": 1,
  "neutralCount": 1,
  "keyInsight": "Most important thing from these headlines for an investor"
}

Score rules:
- 0-30: Very Negative
- 31-45: Negative
- 46-55: Neutral
- 56-70: Positive
- 71-100: Very Positive

label must be one of: VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a financial sentiment analyzer. Respond in valid JSON only. No markdown, no extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const raw = response.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error('Groq sentiment error:', error.message);
    return {
      score: 50,
      label: 'NEUTRAL',
      summary: 'Could not analyze sentiment',
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      keyInsight: 'N/A'
    };
  }
};

// Main function
const getStockSentiment = async (companyName) => {
  const { headlines } = await fetchStockNews(companyName);
  const sentiment = await analyzeSentiment(companyName, headlines);

  return {
    companyName,
    headlines,
    sentiment
  };
};

module.exports = { getStockSentiment };