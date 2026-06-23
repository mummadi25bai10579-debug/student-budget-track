import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { Category } from '../types';
import { ArrowLeft, Edit2, Check, HelpCircle, Save } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';

export const SetBudgetScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, saveBudget } = useAppState();

  const [totalBudget, setTotalBudget] = useState<number>(state.budget?.monthlyBudget || 0);
  const [limits, setLimits] = useState<Record<Category, number>>(
    state.budget?.categoryBudgets || {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Education: 0,
      Entertainment: 0,
    }
  );

  const [isEditing, setIsEditing] = useState<Record<Category, boolean>>({
    Food: false,
    Transport: false,
    Shopping: false,
    Education: false,
    Entertainment: false,
  });
  const [showToast, setShowToast] = useState(false);

  // New total, recalculated from limits
  const totalBudgetAmount = (Object.keys(limits) as Category[]).reduce((sum, cat) => sum + limits[cat], 0);

  // Automatically calculate categories when total budget changes (optional enhancement)
  const handleTotalBudgetChange = (total: number) => {
    setTotalBudget(total);
    setLimits({
      Food: Math.round(total * 0.3),
      Transport: Math.round(total * 0.2),
      Shopping: Math.round(total * 0.2),
      Education: Math.round(total * 0.2),
      Entertainment: Math.round(total * 0.1),
    });
  };

  // Emojis mapping
  const categoryEmojis: Record<Category, string> = {
    Food: '🍔',
    Transport: '🚌',
    Shopping: '🛍️',
    Education: '📚',
    Entertainment: '🎮',
  };

  const categoryColors: Record<Category, string> = {
    Food: 'bg-orange-500',
    Transport: 'bg-blue-600',
    Shopping: 'bg-pink-500',
    Education: 'bg-green-500',
    Entertainment: 'bg-purple-500',
  };

  const categoryTextColors: Record<Category, string> = {
    Food: 'text-orange-500',
    Transport: 'text-blue-600',
    Shopping: 'text-pink-600',
    Education: 'text-green-600',
    Entertainment: 'text-purple-600',
  };

  const handleLimitChange = (category: Category, value: string) => {
    const numeric = parseInt(value);
    if (!isNaN(numeric) && numeric >= 0) {
      setLimits((prev) => ({
        ...prev,
        [category]: numeric,
      }));
    }
  };

  const handleSaveBudget = async () => {
    await saveBudget({
      monthlyBudget: totalBudgetAmount,
      categoryBudgets: limits,
      totalSpent: state.budget?.totalSpent || 0,
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile Frame with Lavender-grey background */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#ded4e2] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100 p-6">
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-5">
            <button
              id="back-set-budget"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white/40 hover:bg-white/60 text-gray-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">
              Set Monthly Budget
            </h2>
          </div>

          {/* 1. Monthly Budget Amount Input/View */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-[#cbe1ef] mb-6">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider font-sans">Monthly Budget Amount</span>
            <div className="flex items-center mt-2">
              <span className="text-xl mr-1 text-[#94a3b8] font-bold">₹</span>
              <input
                type="number"
                value={totalBudget || ''}
                onChange={(e) => handleTotalBudgetChange(Number(e.target.value))}
                className="text-3xl font-black text-[#0f172a] font-sans tracking-tight w-full bg-transparent border-none outline-none"
                placeholder="Enter amount"
              />
            </div>
            
            {!state.budget && (
              <span className="text-xs text-red-500 font-bold mt-2 font-sans">No budget configured</span>
            )}
          </div>

          <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3 px-1 font-sans">
            Category wise Amount
          </h3>

          {/* 2. Category list card */}
          <div id="category-budget-panel" className="bg-white rounded-3xl p-5 shadow-lg border border-gray-50 flex-1 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4 pt-1 overflow-y-auto max-h-[380px] pr-1">
              
              {(Object.keys(limits) as Category[]).map((cat) => {
                // Calculate actual spent in this category
                const spent = state.expenses
                  .filter((e) => e.category === cat)
                  .reduce((sum, e) => sum + e.amount, 0);

                const limitVal = limits[cat];
                const percentage = limitVal > 0 ? Math.min(100, Math.round((spent / limitVal) * 100)) : 0;

                return (
                  <div key={cat} className="space-y-1.5 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      {/* Left: Emoji & Label */}
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl" role="img" aria-label={cat}>{categoryEmojis[cat]}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 leading-tight font-sans">{cat}</span>
                          <span className="text-[11px] font-semibold text-gray-500">
                            Spent: ₹{spent} /
                          </span>
                        </div>
                      </div>

                      {/* Right: Editable Budget Limit Input */}
                      <div className="flex items-center space-x-2">
                        {isEditing[cat] ? (
                          <div className="flex items-center space-x-1 animate-fade-in">
                            <span className="text-xs font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              value={limits[cat]}
                              onChange={(e) => handleLimitChange(cat, e.target.value)}
                              className="w-14 text-center py-0.5 px-1 bg-gray-100 border border-blue-400 rounded text-xs font-bold text-gray-850"
                              autoFocus
                              min="0"
                            />
                            <button
                              onClick={() => setIsEditing((prev) => ({ ...prev, [cat]: false }))}
                              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                              title="Confirm"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-extrabold text-gray-700 font-sans">
                              Limit:  ₹{limitVal}
                            </span>
                            <button
                              onClick={() => setIsEditing((prev) => ({ ...prev, [cat]: true }))}
                              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                              title="Edit limit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <span className={`text-xs font-black p-0.5 px-1.5 rounded-md bg-gray-50 ${categoryTextColors[cat]} font-sans`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar styled to match category color */}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${categoryColors[cat]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Save Budget main CTA */}
            <button
              id="budget-save-main-btn"
              onClick={handleSaveBudget}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-center tracking-wide text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              Save Budget
            </button>

          </div>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="absolute top-6 left-6 right-6 bg-green-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-center animate-pulse z-50">
            <Check className="w-5 h-5 mr-2" />
            <span className="font-bold">Budget Saved Successfully</span>
          </div>
        )}

        {/* Navigation bottom row */}
        <BottomNavigation />
        
      </div>
    </div>
  );
};
