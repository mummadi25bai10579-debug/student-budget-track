import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { Category } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, ArrowDown, Sparkles, TrendingDown, ClipboardList } from 'lucide-react';

type TabType = 'weekly' | 'monthly' | 'yearly';

export const ReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppState();

  const [activeTab, setActiveTab] = useState<TabType>('monthly');

  // Emojis mapping
  const categoryEmojis: Record<Category, string> = {
    Food: '🍔',
    Transport: '🚌',
    Shopping: '🛍️',
    Education: '📚',
    Entertainment: '🎮',
  };

  const colorsMap: Record<Category, string> = {
    Food: '#f97316',        // Orange
    Transport: '#3b82f6',   // Blue
    Shopping: '#a855f7',    // Purple
    Education: '#10b981',   // Green
    Entertainment: '#ec4899', // Pink
  };

  // Calculate statistics based on real expense data
  const getExpensesForTab = (tab: TabType) => {
    const now = new Date();
    return state.expenses.filter((e) => {
      const eDate = new Date(e.date);
      if (tab === 'weekly') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return eDate >= lastWeek;
      } else if (tab === 'monthly') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return eDate >= lastMonth;
      } else { // yearly
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);
        return eDate >= lastYear;
      }
    });
  };

  const filteredExpenses = getExpensesForTab(activeTab);
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Compute category totals and percentages
  const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment'];
  const categorySummary = categories.map((cat) => {
    const amount = filteredExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      category: cat,
      amount,
      emoji: categoryEmojis[cat],
      color: colorsMap[cat],
    };
  });

  const aggregateSpent = totalSpent;

  const pieData = categorySummary
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: c.category,
      value: c.amount,
      percentage: aggregateSpent > 0 ? Math.round((c.amount / aggregateSpent) * 100) : 0,
      color: c.color,
    }));

  const activePieData = pieData.length > 0 ? pieData : [{ name: 'Empty', value: 1, percentage: 0, color: '#e5e7eb' }];

  // Dynamic "Top Category" detection
  const sortedSummary = [...categorySummary].sort((a, b) => b.amount - a.amount);
  const topCategory = sortedSummary[0]?.amount > 0 ? sortedSummary[0] : null;

  // Trend Data calculated from real expenses
  const generateTrendData = () => {
    // Generate data points based on frequency (Weekly, Monthly, Yearly)
    const dataPoints: { name: string; Spent: number }[] = [];
    
    // Simplification for the chart: aggregate by relative time periods
    // For this example, we'll create static buckets of expense dates.
    // Given the simplicity requested, we'll bucket by weekly periods over the last month for 'monthly'
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      
      const spent = state.expenses
        .filter(e => new Date(e.date) >= start && new Date(e.date) < end)
        .reduce((sum, e) => sum + e.amount, 0);
      
      dataPoints.push({ name: `W-${i+1}`, Spent: spent });
    }
    dataPoints.push({ name: 'Latest', Spent: totalSpent });
    return dataPoints;
  };
  const trendData = generateTrendData();

  // Trend calculation
  const getTrendPercent = () => {
      const now = new Date();
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      
      const prevMonth = new Date(now);
      prevMonth.setMonth(now.getMonth() - 2);

      const currentPeriodSpent = state.expenses
        .filter(e => new Date(e.date) >= lastMonth)
        .reduce((sum, e) => sum + e.amount, 0);

      const prevPeriodSpent = state.expenses
        .filter(e => new Date(e.date) >= prevMonth && new Date(e.date) < lastMonth)
        .reduce((sum, e) => sum + e.amount, 0);
      
      if (prevPeriodSpent === 0) return 0;
      return Math.round(((currentPeriodSpent - prevPeriodSpent) / prevPeriodSpent) * 100);
  };
  const trendPercent = getTrendPercent();

  // Debug Logs
  console.log("EXPENSE_COUNT:", filteredExpenses.length);
  console.log("TOTAL_SPENT:", totalSpent);
  console.log("GRAPH_DATA:", trendData);
  console.log("TREND_PERCENT:", trendPercent);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile Frame with muted purple/pink background */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#dfbdd6] overflow-hidden flex flex-col justify-start relative p-6 border border-gray-150">
        
        {/* Header toolbar */}
        <div className="flex items-center space-x-4 mb-4 mt-2">
          <button
            id="report-back-btn"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full bg-white/40 hover:bg-white/60 text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">
            Report and Analytics
          </h2>
        </div>

        {/* 1. Dynamic Period Picker Tabs (Weekly, Monthly, Yearly) */}
        <div id="reports-tab-bar" className="grid grid-cols-3 gap-2 p-1.5 bg-[#cb9ab6]/30 rounded-2xl mb-4">
          <button
            id="tab-weekly"
            onClick={() => setActiveTab('weekly')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'weekly'
                ? 'bg-[#12bda0] text-white shadow'
                : 'text-[#1e3a34] hover:bg-white/20'
            }`}
          >
            Weekly
          </button>
          
          <button
            id="tab-monthly"
            onClick={() => setActiveTab('monthly')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'monthly'
                ? 'bg-[#7c5dfa]/80 text-white shadow'
                : 'text-[#1e3a34] hover:bg-white/20'
            }`}
          >
            Monthly
          </button>
          
          <button
            id="tab-yearly"
            onClick={() => setActiveTab('yearly')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'yearly'
                ? 'bg-[#12bda0] text-white shadow'
                : 'text-[#1e3a34] hover:bg-white/20'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Scrollable container for card stacks */}
        <div className="space-y-4 overflow-y-auto pb-10 pr-1 max-h-[640px]">
          
          {totalSpent === 0 ? (
            <div className="text-center p-10 bg-white rounded-3xl shadow-lg border border-gray-100">
               <p className="text-gray-500 font-medium">No expense data available</p>
            </div>
          ) : (
             <>
                {/* Card 1: Total Spent stats & PieChart */}
                <div id="card-total-spent" className="bg-white rounded-3xl p-5 shadow-lg border border-gray-50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Spent</span>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-3xl font-black text-[#1b2559] font-sans">
                      ₹{aggregateSpent.toLocaleString('en-IN')}
                    </div>
                    
                    <div className={`flex items-center text-xs font-bold ${trendPercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {trendPercent >= 0 ? <ArrowDown className="w-4 h-4 mr-0.5 transform rotate-180" /> : <ArrowDown className="w-4 h-4 mr-0.5" />}
                      <span>{Math.abs(trendPercent)}% {trendPercent >= 0 ? 'increase' : 'decrease'} from last month</span>
                    </div>
                  </div>

                  {/* Pie Chart and Percentages list */}
                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
                    
                    {/* Graphic container */}
                    <div className="w-28 h-28 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} aspect={1}>
                        <PieChart>
                          <Pie
                            data={activePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={48}
                            dataKey="value"
                          >
                            {activePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Categorised Percentages list */}
                    <div className="flex-1 pl-4 space-y-1.5">
                      {categorySummary.map((c) => {
                        const percent = aggregateSpent > 0 ? Math.round((c.amount / aggregateSpent) * 100) : 0;
                        if (c.amount === 0) return null;
                        return (
                          <div key={c.category} className="flex items-center justify-between text-[11px] font-semibold">
                            <div className="flex items-center space-x-1.5 text-gray-500">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                              <span>{c.category}</span>
                            </div>
                            <span className="text-gray-800 font-bold">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Card 2: Spending Trend Line Graph */}
                <div id="card-trend" className="bg-white rounded-3xl p-5 shadow-lg border border-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 text-sm font-sans">Spending Trend</h3>
                    <span className="text-[10px] bg-purple-50 text-purple-600 p-1 px-2.5 rounded-lg font-bold">
                      This Period
                    </span>
                  </div>

                  {/* Line chart */}
                  <div className="w-full h-36 font-sans">
                     {trendData.length < 2 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">Not enough data for analytics</div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} aspect={1.5}>
                          <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="Spent"
                              stroke="#8b5cf6"
                              strokeWidth={2.5}
                              activeDot={{ r: 6 }}
                              dot={{ r: 4, strokeWidth: 1.5, fill: '#fff' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                     )}
                  </div>
                </div>
              </>
          )}

          {/* Card 3: Top Category */}
          {topCategory && (
            <div id="card-top-category" className="bg-white rounded-3xl p-5 shadow-lg border border-gray-50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-3">
                Top Category
              </h4>
              <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{topCategory.emoji}</span>
                  <div className="flex flex-col">
                    <span className="text-base font-black text-gray-800 font-sans">{topCategory.category}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">Highest major spending</span>
                  </div>
                </div>

                <div className="text-lg font-black text-[#8b5cf6] font-sans">
                  ₹{topCategory.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Quick logs button */}
          <button
            onClick={() => navigate('/expenses')}
            className="w-full py-4 bg-[#7c5dfa] hover:bg-[#6c48ed] text-white rounded-2xl shadow-md font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            Browse Full Expenses Logs
          </button>

        </div>
        
      </div>
    </div>
  );
};
