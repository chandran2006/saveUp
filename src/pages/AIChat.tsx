import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Send, Bot, User as UserIcon, Sparkles, Copy, RefreshCw, Languages, Zap, TrendingUp, PieChart, Target, Lightbulb, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAIResponse } from '../utils/aiKnowledge';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const QUICK_PROMPTS = [
  { icon: TrendingUp, color: 'emerald', text: 'Analyze Spending', prompt: 'Analyze my spending patterns and give detailed insights with recommendations' },
  { icon: PieChart, color: 'blue', text: 'Budget Plan', prompt: 'Create a personalized budget plan based on my income and expenses' },
  { icon: Target, color: 'purple', text: 'Savings Goals', prompt: 'Help me set realistic savings goals and create an action plan' },
  { icon: Lightbulb, color: 'yellow', text: 'Money Tips', prompt: 'Give me 5 practical tips to save money and reduce expenses' },
  { icon: DollarSign, color: 'green', text: 'Investment Guide', prompt: 'Suggest beginner-friendly investment strategies for my profile' },
  { icon: Zap, color: 'red', text: 'Quick Review', prompt: 'Quick financial health check - what should I focus on?' },
];

export function AIChat() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [context, setContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadContext();
      initChat();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadContext() {
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id);
    const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', user?.id);
    const income = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const expense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
    setContext({ transactions, budgets, income, expense });
  }

  function initChat() {
    const welcomeMsg: Message = {
      id: '1',
      role: 'assistant',
      content: `👋 Hello! I'm your AI Financial Advisor.\n\nI can help you with:\n\n💰 Budget Planning & Optimization\n📊 Spending Analysis & Insights\n💡 Personalized Savings Strategies\n📈 Investment Recommendations\n🎯 Financial Goal Setting\n🔍 Expense Review & Cost Cutting\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
  }

  async function sendMessage(text: string) {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/ai/chat', {
        message: text,
        context: context,
        userId: user?.id,
        language: language
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || response.data.message || 'No response',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Try local AI knowledge base first
      const localResponse = getAIResponse(text, context);
      
      if (localResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: localResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📊 Based on your financial data:\n\n💰 Total Income: ₹${context?.income?.toLocaleString() || 0}\n💸 Total Expense: ₹${context?.expense?.toLocaleString() || 0}\n💵 Net Balance: ₹${((context?.income || 0) - (context?.expense || 0)).toLocaleString()}\n\n💡 Quick Tips:\n• Aim to save at least 20% of your income\n• Track all expenses to identify spending patterns\n• Create an emergency fund covering 3-6 months expenses\n• Review and optimize your budget monthly\n\n⚠️ Note: AI service is offline. Try asking specific questions like:\n• How much should I save?\n• How do I create a budget?\n• How can I reduce expenses?`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
  }

  function clearChat() {
    if (confirm('Clear all messages?')) {
      initChat();
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <DashboardLayout title="AI Financial Advisor">
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
                <Sparkles className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">AI Financial Advisor</h1>
                <p className="text-emerald-100 text-sm flex items-center gap-2">
                  <Zap size={14} />
                  Powered by Advanced AI • {messages.length - 1} conversations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all border border-white/30 shadow-lg">
                  <Languages size={18} />
                  <span className="font-medium">{selectedLang.flag} {selectedLang.name}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 transition-colors">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={clearChat} className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all border border-white/30 shadow-lg">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-emerald-600" />
              Quick Actions - Get instant insights
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {QUICK_PROMPTS.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button key={i} onClick={() => sendMessage(prompt.prompt)} className="group relative flex items-center gap-3 p-5 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/20 dark:hover:to-green-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl transition-all hover:shadow-xl hover:scale-105 text-left">
                    <div className={`p-3 rounded-lg bg-${prompt.color}-100 dark:bg-${prompt.color}-900/20 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={`text-${prompt.color}-600 dark:text-${prompt.color}-400`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${message.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'}`}>
                  {message.role === 'user' ? <UserIcon size={22} className="text-white" /> : <Bot size={22} className="text-white" />}
                </div>
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`rounded-2xl px-6 py-4 shadow-md ${message.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 px-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <button onClick={() => copyMessage(message.content)} className="text-gray-400 hover:text-emerald-600 transition-colors p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-fadeIn">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Bot size={22} className="text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 inline-flex items-center gap-3 shadow-md">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} placeholder="Ask me anything about your finances..." className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 placeholder:text-gray-400 shadow-sm" />
              <button type="submit" disabled={loading || !input.trim()} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                <Send size={20} />
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">💡 AI can make mistakes. Verify important financial information.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
