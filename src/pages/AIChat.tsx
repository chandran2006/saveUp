import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Send, Bot, User as UserIcon, Sparkles, Mic, Copy, RefreshCw, Languages } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  { icon: '💰', text: 'Analyze my spending', prompt: 'Analyze my spending patterns for this month and give me insights' },
  { icon: '📊', text: 'Budget advice', prompt: 'Give me budget recommendations based on my income and expenses' },
  { icon: '💡', text: 'Save money tips', prompt: 'How can I save more money? Give me practical tips' },
  { icon: '📈', text: 'Investment ideas', prompt: 'Suggest some investment strategies for beginners' },
  { icon: '🎯', text: 'Financial goals', prompt: 'Help me set realistic financial goals' },
  { icon: '🔍', text: 'Expense review', prompt: 'Review my expenses and identify areas to cut costs' },
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      content: `Hello! 👋 I'm your AI Financial Advisor. I can help you with:\n\n• Budget planning & tracking\n• Spending analysis\n• Savings strategies\n• Investment advice\n• Financial goal setting\n\nWhat would you like to know?`,
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Here's what I can tell you based on your data:\n\n💰 Total Income: ₹${context?.income?.toLocaleString() || 0}\n💸 Total Expense: ₹${context?.expense?.toLocaleString() || 0}\n💵 Balance: ₹${((context?.income || 0) - (context?.expense || 0)).toLocaleString()}\n\nTip: Try to save at least 20% of your income each month!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
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
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="text-emerald-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Financial Advisor</h1>
                <p className="text-emerald-100 text-sm">Powered by advanced AI • {messages.length - 1} messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                  <Languages size={18} />
                  <span>{selectedLang.flag} {selectedLang.name}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span className="text-gray-900 dark:text-white">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={clearChat} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Quick Actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button key={i} onClick={() => sendMessage(prompt.prompt)} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200 dark:border-gray-700 rounded-xl transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 text-left">
                  <span className="text-2xl">{prompt.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                  {message.role === 'user' ? <UserIcon size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                </div>
                <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`rounded-2xl px-5 py-3 ${message.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <button onClick={() => copyMessage(message.content)} className="text-gray-400 hover:text-emerald-600 transition-colors">
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-3 inline-flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} placeholder="Ask me anything about your finances..." className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 placeholder:text-gray-400" />
              <button type="button" className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
                <Mic size={20} />
              </button>
              <button type="submit" disabled={loading || !input.trim()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg">
                <Send size={20} />
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
