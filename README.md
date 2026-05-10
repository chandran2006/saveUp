# saveUp 💰

A smart AI-powered personal finance manager built with React, TypeScript, and Supabase.

## Features

- 📊 Dashboard with income/expense overview
- 💳 Transaction tracking with categories
- 📅 Monthly budget management
- 🤖 AI chat for financial insights
- 🧾 Receipt scanner (OCR via Tesseract.js)
- 📈 Spending predictions and financial health score
- 🔔 Notifications and alerts
- 🌐 Multi-language support (i18next)
- 🌙 Dark/light theme

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** AI chat integration via API
- **OCR:** Tesseract.js for receipt scanning
- **Routing:** React Router v7

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd saveUp
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

3. Run the Supabase migration in your project dashboard or CLI:
   ```bash
   supabase db push
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
