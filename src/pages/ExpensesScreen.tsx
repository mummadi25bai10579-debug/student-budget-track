import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { Category } from '../types';
import { BottomNavigation } from '../components/BottomNavigation';
import { ArrowLeft, Plus, Search, Trash2, Calendar, ClipboardList } from 'lucide-react';

export const ExpensesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppState();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Emojis mapping
  const categoryEmojis: Record<Category, string> = {
    Food: '🍔',
    Transport: '🚌',
    Shopping: '🛍️',
    Education: '📚',
    Entertainment: '🎮',
  };

  const categoryBgColors: Record<Category, string> = {
    Food: 'bg-orange-50 text-orange-600',
    Transport: 'bg-blue-50 text-blue-600',
    Shopping: 'bg-pink-55/7 bg-pink-50 text-pink-600',
    Education: 'bg-green-50 text-green-600',
    Entertainment: 'bg-purple-50 text-purple-600',
  };

  // Filter list
  const filtered = state.expenses.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(search.toLowerCase()) || 
                          (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport with pastel beige/purple styling */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#98abc3] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100 p-6">
        
        <div className="flex-1 flex flex-col">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center space-x-3 text-white">
              <button
                id="expenses-back-btn"
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold tracking-tight font-sans">Expense Logs</h2>
            </div>

            <button
              id="expenses-add-inline"
              onClick={() => navigate('/add-expense')}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-transform active:scale-95 shadow cursor-pointer"
              title="Add expense"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input and Categories tabs Row */}
          <div className="space-y-3 mb-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="expenses-search-input"
                type="text"
                placeholder="Search lunch, hoodie, transit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 shadow-sm border-none"
              />
            </div>

            {/* Simple Inline Category Filter Pills */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 max-w-full">
              {(['All', 'Food', 'Transport', 'Shopping', 'Education', 'Entertainment'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide flex-shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/40 text-blue-900 hover:bg-white/50'
                  }`}
                >
                  {cat !== 'All' ? `${categoryEmojis[cat as Category]} ${cat}` : '🌍 All'}
                </button>
              ))}
            </div>

          </div>

          {/* White Card housing Logs */}
          <div id="expenses-logs-container" className="bg-white rounded-3xl p-5 shadow-lg border border-gray-50 flex-1 flex flex-col justify-start max-h-[460px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-gray-400">
                <ClipboardList className="w-12 h-12 text-gray-300 stroke-[1.5] mb-2" />
                <p className="text-xs font-bold font-sans">No transactions match filters</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="text-xs font-bold text-blue-500 mt-2 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filtered.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex justify-between items-center p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-100/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Emoji Icon Bubble */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${categoryBgColors[exp.category]}`}>
                        {categoryEmojis[exp.category]}
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-gray-800 leading-tight font-sans">
                          {exp.name}
                        </span>
                        
                        {exp.notes && (
                          <span className="text-[10px] text-gray-400 line-clamp-1 italic max-w-[160px] mt-0.5">
                            "{exp.notes}"
                          </span>
                        )}

                        <span className="text-[9px] text-gray-400 flex items-center gap-1 font-bold tracking-wide mt-1 font-sans">
                          <Calendar className="w-2.5 h-2.5 text-gray-400" />
                          {exp.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-black text-gray-900 font-sans">
                        -₹{exp.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Home bottom layout */}
        <BottomNavigation />
        
      </div>
    </div>
  );
};
