export const aiKnowledgeBase = [
  // Budget & Planning
  {
    question: "How much should I save each month?",
    answer: "A good rule of thumb is the 50/30/20 rule:\n\n• 50% for needs (rent, food, bills)\n• 30% for wants (entertainment, dining out)\n• 20% for savings and debt repayment\n\nBased on your income of ₹{income}, aim to save at least ₹{savings} per month."
  },
  {
    question: "How do I create a budget?",
    answer: "Follow these steps:\n\n1. Calculate total monthly income\n2. List all fixed expenses (rent, bills)\n3. Track variable expenses (food, transport)\n4. Set spending limits for each category\n5. Review and adjust monthly\n\nYour current spending is ₹{expense}. I recommend setting a budget of ₹{budget}."
  },
  {
    question: "What is an emergency fund?",
    answer: "An emergency fund is money saved for unexpected expenses like:\n\n• Medical emergencies\n• Job loss\n• Car/home repairs\n• Urgent travel\n\nAim to save 3-6 months of expenses. Based on your spending of ₹{expense}/month, target ₹{emergency} for your emergency fund."
  },

  // Expense Management
  {
    question: "How can I reduce my expenses?",
    answer: "Top 10 ways to cut costs:\n\n1. Cook at home instead of eating out\n2. Cancel unused subscriptions\n3. Use public transport\n4. Buy generic brands\n5. Plan purchases, avoid impulse buying\n6. Use coupons and cashback\n7. Reduce energy consumption\n8. Buy in bulk for essentials\n9. DIY when possible\n10. Compare prices before buying\n\nYour top expense category is {topCategory}. Focus on reducing this first."
  },
  {
    question: "Why am I overspending?",
    answer: "Common reasons for overspending:\n\n• No budget tracking\n• Impulse purchases\n• Lifestyle inflation\n• Emotional spending\n• Not tracking small expenses\n• Using credit cards carelessly\n\nYou've spent ₹{expense} this month. Review your {topCategory} expenses - that's your highest category."
  },

  // Investment & Growth
  {
    question: "Where should I invest my money?",
    answer: "Investment options for beginners:\n\n1. Fixed Deposits (FD) - Safe, 5-7% returns\n2. Public Provident Fund (PPF) - Tax-free, 7-8%\n3. Mutual Funds - Moderate risk, 10-12%\n4. Stocks - High risk, 12-15%\n5. Gold - Hedge against inflation\n\nStart with low-risk options like FD/PPF. Invest only surplus money after emergency fund."
  },
  {
    question: "What is SIP?",
    answer: "SIP (Systematic Investment Plan):\n\n• Invest fixed amount regularly (monthly)\n• In mutual funds\n• Benefits from rupee cost averaging\n• Minimum ₹500/month\n• Good for long-term wealth creation\n\nWith your savings potential of ₹{savings}/month, consider starting a SIP of ₹{sip}."
  },

  // Debt Management
  {
    question: "How do I pay off debt faster?",
    answer: "Debt repayment strategies:\n\n1. Snowball Method: Pay smallest debts first\n2. Avalanche Method: Pay highest interest first\n3. Consolidate multiple debts\n4. Negotiate lower interest rates\n5. Increase income through side hustles\n6. Cut unnecessary expenses\n\nPrioritize high-interest debt (credit cards) first. Aim to pay more than minimum."
  },

  // Savings Goals
  {
    question: "How do I save for a big purchase?",
    answer: "Steps to save for goals:\n\n1. Set specific target amount\n2. Set deadline\n3. Calculate monthly savings needed\n4. Open separate savings account\n5. Automate transfers\n6. Track progress monthly\n\nExample: For ₹1,00,000 in 12 months, save ₹8,334/month."
  },

  // Tax Planning
  {
    question: "How can I save tax?",
    answer: "Tax-saving options under Section 80C:\n\n• PPF - Up to ₹1.5 lakh\n• ELSS Mutual Funds - ₹1.5 lakh\n• Life Insurance - ₹1.5 lakh\n• Home Loan Principal - ₹1.5 lakh\n• NPS - Additional ₹50,000\n• Health Insurance - ₹25,000-₹50,000\n\nTotal tax saving potential: ₹2 lakh deduction = Save ₹62,400 tax (31% bracket)."
  },

  // Financial Health
  {
    question: "Am I financially healthy?",
    answer: "Financial health indicators:\n\n✅ Emergency fund: 3-6 months expenses\n✅ Savings rate: 20%+ of income\n✅ Debt-to-income: Below 40%\n✅ Budget adherence: 90%+\n✅ Regular investments\n\nYour stats:\n• Income: ₹{income}\n• Expenses: ₹{expense}\n• Savings Rate: {savingsRate}%\n• Status: {healthStatus}"
  },

  // Income Growth
  {
    question: "How can I increase my income?",
    answer: "Ways to boost income:\n\n1. Ask for raise/promotion\n2. Switch jobs for better pay\n3. Freelancing/consulting\n4. Start side business\n5. Sell unused items\n6. Rent out space/assets\n7. Teach/tutor online\n8. Invest in skill development\n9. Passive income (dividends, rent)\n10. Part-time work\n\nFocus on skills that pay well in your field."
  },

  // Credit Score
  {
    question: "How do I improve my credit score?",
    answer: "Credit score improvement tips:\n\n1. Pay bills on time (35% impact)\n2. Keep credit utilization below 30%\n3. Don't close old credit cards\n4. Limit hard inquiries\n5. Mix of credit types\n6. Check report for errors\n7. Pay more than minimum\n\nGood score: 750+\nExcellent: 800+\n\nTakes 6-12 months to see improvement."
  },

  // Insurance
  {
    question: "What insurance do I need?",
    answer: "Essential insurance coverage:\n\n1. Health Insurance\n   • Minimum ₹5 lakh cover\n   • Family floater recommended\n\n2. Term Life Insurance\n   • 10-15x annual income\n   • If you have dependents\n\n3. Accidental Insurance\n   • Additional protection\n\n4. Vehicle Insurance\n   • Mandatory by law\n\nPriority: Health > Term Life > Others"
  },

  // Retirement Planning
  {
    question: "How much do I need for retirement?",
    answer: "Retirement planning formula:\n\n1. Estimate monthly expenses at retirement\n2. Multiply by 12 for yearly\n3. Multiply by 25-30 years\n4. Account for inflation (6-7%)\n\nExample:\n• Current age: 30\n• Retirement age: 60\n• Monthly need: ₹50,000\n• Corpus needed: ₹3-4 crore\n\nStart early! Invest ₹10,000/month in equity for 30 years = ₹3.5 crore (12% returns)."
  }
];

export function getAIResponse(question: string, context: any): string {
  const income = context?.income || 0;
  const expense = context?.expense || 0;
  const savings = Math.round(income * 0.2);
  const budget = Math.round(expense * 1.1);
  const emergency = expense * 6;
  const sip = Math.round(savings * 0.5);
  const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
  const healthStatus = Number(savingsRate) >= 20 ? 'Good' : Number(savingsRate) >= 10 ? 'Fair' : 'Needs Improvement';
  
  const categories = context?.transactions?.reduce((acc: any, t: any) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {}) || {};
  
  const topCategory = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'food';

  // Find matching question
  const match = aiKnowledgeBase.find(item => 
    question.toLowerCase().includes(item.question.toLowerCase().split(' ').slice(0, 3).join(' '))
  );

  if (match) {
    return match.answer
      .replace(/{income}/g, income.toLocaleString())
      .replace(/{expense}/g, expense.toLocaleString())
      .replace(/{savings}/g, savings.toLocaleString())
      .replace(/{budget}/g, budget.toLocaleString())
      .replace(/{emergency}/g, emergency.toLocaleString())
      .replace(/{sip}/g, sip.toLocaleString())
      .replace(/{savingsRate}/g, savingsRate.toString())
      .replace(/{healthStatus}/g, healthStatus)
      .replace(/{topCategory}/g, topCategory);
  }

  return '';
}
