import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Plus, PiggyBank, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-around shadow-lg">
      <button
        id="nav-home"
        onClick={() => navigate('/dashboard')}
        className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-colors ${
          isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium font-sans">Home</span>
      </button>

      <button
        id="nav-expenses"
        onClick={() => navigate('/expenses')}
        className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-colors ${
          isActive('/expenses') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <ClipboardList className="w-6 h-6" />
        <span className="text-[10px] font-medium font-sans">Expenses</span>
      </button>

      {/* Floating Center Action Button */}
      <div className="relative -top-5">
        <button
          id="nav-add-expense"
          onClick={() => navigate('/add-expense')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg border-4 border-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <button
        id="nav-budget"
        onClick={() => navigate('/set-budget')}
        className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-colors ${
          isActive('/set-budget') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <PiggyBank className="w-6 h-6" />
        <span className="text-[10px] font-medium font-sans">Budget</span>
      </button>

      <button
        id="nav-profile"
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-colors ${
          isActive('/profile') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium font-sans">Profile</span>
      </button>
    </div>
  );
};
