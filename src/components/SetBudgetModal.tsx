import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { Category } from '../types';

export const SetBudgetModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [budget, setBudget] = useState('');
  const { saveBudget, state } = useAppState();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budget);
    if (!isNaN(amount) && amount > 0) {
      const categoryBudgets: Record<Category, number> = {
        Food: Math.round(amount * 0.3),
        Transport: Math.round(amount * 0.2),
        Shopping: Math.round(amount * 0.2),
        Education: Math.round(amount * 0.2),
        Entertainment: Math.round(amount * 0.1),
      };

      await saveBudget({
        monthlyBudget: amount,
        categoryBudgets,
        totalSpent: state.budget?.totalSpent || 0,
      });
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-slide-up border-t border-gray-100 max-w-md">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 font-sans">
            <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-100" />
            Set Monthly Budget
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                ₹
              </span>
              <input
                id="budget-amount-input"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full py-3.5 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base font-bold text-gray-800"
                required
                min="1"
              />
            </div>
          </div>

          <button
            id="budget-save-btn"
            type="submit"
            className="w-full py-4 bg-[#33d69f] hover:bg-[#25ca90] text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer mt-2 leading-none"
          >
            Save Budget
          </button>
        </form>
      </div>
    </div>
  );
};
