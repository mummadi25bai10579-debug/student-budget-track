import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { Category } from '../types';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export const AddExpenseScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addExpense } = useAppState();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState('2026-06-21'); // Pre-populated date matching wireframe "21 June 2026"
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (!name.trim()) {
      alert('Please enter an expense name');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addExpense({
      name: name.trim(),
      amount: parsedAmount,
      category,
      date,
      notes: notes.trim() || undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport simulator with slate-blue background */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#4b6d8a] overflow-hidden flex flex-col justify-between relative p-6 pb-8 border border-gray-100">
        
        <div className="flex-1 flex flex-col">
          {/* Header row with Title and Back arrow */}
          <div className="flex items-center space-x-4 mb-4 mt-2">
            <button
              id="back-add-expense"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight font-sans">
              Add New Expense
            </h2>
          </div>

          {success ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#ccd29d] rounded-3xl my-auto animate-pulse">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
                ✓
              </div>
              <h3 className="text-2xl font-black text-gray-900">Saved Successfully!</h3>
              <p className="text-sm text-gray-700 mt-2">Your dashboard values have been updated.</p>
            </div>
          ) : (
            /* Sand-Olive Card Container */
            <form onSubmit={handleSubmit} className="bg-[#ccd29d] rounded-3xl p-6 shadow-xl space-y-5 flex-1 flex flex-col justify-between border border-[#b4bb84]">
              
              <div className="space-y-4">
                {/* 1. Expense Name */}
                <div className="space-y-1.5">
                  <label htmlFor="expense-name" className="block text-sm font-bold text-gray-900 font-sans">
                    Expense Name
                  </label>
                  <input
                    id="expense-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g Lunch , Bus Ticket"
                    className="w-full py-3 px-4.5 bg-[#77ccbc] hover:bg-[#6cbfb0] focus:bg-[#5db2a3] text-gray-900 placeholder-gray-800 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans"
                    required
                  />
                </div>

                {/* 2. Amount */}
                <div className="space-y-1.5">
                  <label htmlFor="expense-amount" className="block text-sm font-bold text-gray-900 font-sans">
                    Amount
                  </label>
                  <input
                    id="expense-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g 360"
                    className="w-full py-3 px-4.5 bg-[#77ccbc] hover:bg-[#6cbfb0] focus:bg-[#5db2a3] text-gray-900 placeholder-gray-800 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans"
                    required
                    min="1"
                  />
                </div>

                {/* 3. Category */}
                <div className="space-y-1.5">
                  <label htmlFor="expense-category" className="block text-sm font-bold text-gray-900 font-sans">
                    Category
                  </label>
                  <select
                    id="expense-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full py-3 px-4.5 bg-[#77ccbc] hover:bg-[#6cbfb0] focus:bg-[#5db2a3] text-gray-900 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans cursor-pointer"
                  >
                    <option value="Food">Food 🍔</option>
                    <option value="Transport">Transport 🚌</option>
                    <option value="Shopping">Shopping 🛍️</option>
                    <option value="Education">Education 📚</option>
                    <option value="Entertainment">Entertainment 🎮</option>
                  </select>
                </div>

                {/* 4. Date */}
                <div className="space-y-1.5">
                  <label htmlFor="expense-date" className="block text-sm font-bold text-gray-900 font-sans">
                    Date
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full py-3 px-4.5 bg-[#77ccbc] hover:bg-[#6cbfb0] focus:bg-[#5db2a3] text-gray-900 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans cursor-pointer"
                    required
                  />
                </div>

                {/* 5. Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="expense-notes" className="block text-sm font-bold text-gray-900 font-sans">
                    Notes (optional)
                  </label>
                  <textarea
                    id="expense-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note"
                    rows={3}
                    className="w-full py-3 px-4.5 bg-[#77ccbc] hover:bg-[#6cbfb0] focus:bg-[#5db2a3] text-gray-900 placeholder-gray-800 font-semibold rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-sans resize-none"
                  />
                </div>
              </div>

              {/* Save Expense Button */}
              <button
                id="expense-save-btn"
                type="submit"
                className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl shadow-lg transition-all text-center tracking-wider text-base leading-none cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Expense
              </button>

            </form>
          )}

        </div>
        
      </div>
    </div>
  );
};
