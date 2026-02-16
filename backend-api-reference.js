// Backend API Reference - Implement these endpoints in your backend (Node.js/Python/Java)

// 1. AI Chat Endpoint
// POST /api/ai/chat
// Body: { message: string, context: { transactions, budgets }, userId: string }
// Response: { response: string }
// Use OpenAI/Gemini/Claude API to generate financial advice based on user context

// 2. Receipt Scanner Endpoint
// POST /api/receipt/scan
// Body: FormData with image file
// Response: { amount: number, category: string, description: string, date: string }
// Use OCR (Tesseract/Google Vision API) to extract data from receipt image

// 3. Spending Prediction Endpoint
// POST /api/predict/spending
// Body: { transactions: Transaction[] }
// Response: { predictions: [{ category: string, amount: number, confidence: number }] }
// Use ML model (scikit-learn/TensorFlow) to predict next month spending

// Example Node.js Implementation:

const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const Tesseract = require('tesseract.js');

const app = express();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI Chat
app.post('/api/ai/chat', async (req, res) => {
  const { message, context } = req.body;
  
  const systemPrompt = `You are a financial advisor. User has ${context.transactions?.length || 0} transactions. 
  Total income: ${context.transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0}
  Total expense: ${context.transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0}`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]
  });
  
  res.json({ response: completion.choices[0].message.content });
});

// Receipt Scanner
app.post('/api/receipt/scan', upload.single('image'), async (req, res) => {
  const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
  
  // Extract amount (simple regex)
  const amountMatch = text.match(/\$?(\d+\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // Extract date
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  const date = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  res.json({ amount, category: 'other', description: 'Receipt scan', date });
});

// Spending Prediction
app.post('/api/predict/spending', (req, res) => {
  const { transactions } = req.body;
  
  // Simple prediction: average of last 3 months by category
  const categoryAvg = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryAvg[t.category] = (categoryAvg[t.category] || 0) + t.amount;
    }
  });
  
  const predictions = Object.entries(categoryAvg).map(([category, total]) => ({
    category,
    amount: Math.round(total / 3),
    confidence: 0.75
  }));
  
  res.json({ predictions });
});

app.listen(8080, () => console.log('API running on port 8080'));
