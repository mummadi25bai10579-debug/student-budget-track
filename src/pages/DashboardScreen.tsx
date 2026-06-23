import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { Category } from "../types";
import { BottomNavigation } from "../components/BottomNavigation";
import {
  Bell,
  Plus,
  IndianRupee,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  FileBarChart,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { UserAvatar } from "../components/UserAvatar";
import { SetBudgetModal } from "../components/SetBudgetModal";

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, addIncome } = useAppState();

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [incAmount, setIncAmount] = useState("");
  const [incSource, setIncSource] = useState("Monthly Allowance");
  const [incDate, setIncDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filter, setFilter] = useState<"This Week" | "This Month">(
    "This Month",
  );

  // Filter expenses based on selected time range
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(currentDay - now.getDay()); // Sunday as start of week

  const filteredExpenses = state.expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    if (filter === "This Week") {
      return expDate >= startOfWeek;
    } else {
      // This Month
      return (
        expDate.getFullYear() === currentYear &&
        expDate.getMonth() === currentMonth
      );
    }
  });

  useEffect(() => {
    console.log("DASHBOARD RENDERED");
    console.log("DASHBOARD LOADED");
  }, []);

  if (!state.isProfileLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calculations
  const totalBudgetAmount = state.budget?.monthlyBudget || 0;

  // Sum of filtered expenses
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudgetAmount - totalSpent; 
  const usedPercent = totalBudgetAmount > 0 ? Math.min(100, Math.round((totalSpent / totalBudgetAmount) * 100)) : 0;
  
  console.log("BUDGET LOADED:", state.budget !== null);
  console.log("CATEGORY BUDGETS:", state.budget?.categoryBudgets);
  console.log("TOTAL SPENT:", totalSpent);
  console.log("REMAINING:", remainingBudget);
  console.log("FIRESTORE DATA:", state.budget);

  // Category counts for the donut chart
  const categories: Category[] = [
    "Food",
    "Transport",
    "Shopping",
    "Education",
    "Entertainment",
  ];
  const colorsMap: Record<Category, string> = {
    Food: "#f97316", // Orange
    Transport: "#3b82f6", // Blue
    Shopping: "#a855f7", // Purple
    Education: "#10b981", // Green
    Entertainment: "#ec4899", // Pink
  };

  const donutData = categories
    .map((cat) => {
      const amount = filteredExpenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: cat,
        value: amount,
        color: colorsMap[cat],
      };
    })
    .filter((item) => item.value > 0);

  // If no data, render a placeholder segment
  const activeDonutData =
    donutData.length > 0
      ? donutData
      : [{ name: "No Expense", value: 1, color: "#e5e7eb" }];

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(incAmount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      addIncome(parsedAmount, incSource, incDate);
      setIncAmount("");
      setShowIncomeModal(false);
      alert(
        `Success: ₹${parsedAmount.toLocaleString("en-IN")} added into income from "${incSource}"`,
      );
    }
  };

  const unreadNotificationsCount = state.notifications.filter(
    (n) => !n.read,
  ).length;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile Frame */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#eaadb3] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100">
        <div className="flex-1 flex flex-col">
          {/* 1. Teal Header Block */}
          <div
            id="dashboard-header"
            className="bg-[#3bc6b1] p-6 pb-24 rounded-b-[36px] relative text-white"
          >
            {/* Top Row: Back button, notify bell, and avatar */}
            <div className="flex justify-between items-start mt-1">
              <button
                id="dashboard-settings-btn"
                onClick={() => {
                  navigate("/settings");
                }}
                className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sliders className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <button
                  id="dashboard-bell"
                  onClick={() => navigate("/notifications")}
                  className="w-11 h-11 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 shadow-md relative flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-550 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Profile Avatar */}
                <UserAvatar
                  name={state.profile.name}
                  email={state.profile.email}
                  avatarUrl={state.profile.avatarUrl}
                  onClick={() => navigate("/profile")}
                  className="w-11 h-11 text-sm font-bold"
                />
              </div>
            </div>

            {/* Title / Greetings Group */}
            <div className="mt-4">
              <span className="text-[22px] font-bold text-white drop-shadow-sm font-sans block">
                Hi, {state.profile.name || "USERNAME_NOT_FOUND"}
              </span>
              <h2 className="text-[25px] font-extrabold tracking-tight text-white leading-tight mt-0.5 font-sans">
                Let's manage your finances
              </h2>
            </div>
          </div>

          {/* 2. Monthly Budget Grey Box & Floating Overlapping Card */}
          <div className="px-6 -mt-16 relative z-10">
            <div className="bg-[#dce2e6] rounded-[28px] p-5 pb-7 shadow-lg border border-[#ccd5db]/60">
              {state.budget ? (
                <>
                  <h3 className="text-[#0e162f] font-black text-base tracking-tight font-sans mb-3 text-left">
                    Monthly Budget
                  </h3>

                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 tracking-wide px-1">
                    <span className="font-sans">Total Budget</span>
                    <span className="font-sans">Remaining</span>
                  </div>

                  {/* White Overlay Floating Container */}
                  <div
                    id="dashboard-budget-card"
                    className="bg-white rounded-2xl p-4.5 mt-2.5 shadow-md border border-[#cbe1ef]"
                  >
                    <div className="flex justify-between items-baseline">
                      <div className="text-[22px] font-black text-gray-950 flex items-center font-sans tracking-tight">
                        <span className="text-lg mr-0.5">₹</span>
                        {totalBudgetAmount.toLocaleString("en-IN")}
                      </div>

                      <div className="text-[20px] font-bold text-[#20a46b] flex items-center font-sans tracking-tight">
                        <span>₹</span>
                        {remainingBudget.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Recharts / Tailwind progress bar */}
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2.5 mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0066ff] to-[#00d2ff] h-full rounded-full transition-all duration-500"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>

                    <div className="text-left text-[11px] font-bold text-gray-500 mt-2 font-sans-mono">
                      {usedPercent}% Used
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <h3 className="text-[#0e162f] font-black text-base mb-1 font-sans">
                    Welcome, {state.profile.name.split(' ')[0]}
                  </h3>
                  <p className="text-[#0e162f]/80 text-sm mb-4 font-medium">
                    You haven't set a monthly budget yet.
                  </p>
                  <button
                    onClick={() => setShowBudgetModal(true)}
                    className="bg-[#0e162f] text-white py-2.5 px-6 rounded-xl font-bold hover:bg-[#1a2545] transition-all shadow-md"
                  >
                    + Set Budget
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Expense Overview Donut Chart Card */}
          <div className="px-6 mt-5">
            <div
              id="dashboard-chart-card"
              className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 flex flex-col"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-sm font-sans">
                  Expense Overview
                </h3>
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "This Week" | "This Month")
                  }
                  className="bg-gray-100 rounded-lg py-1 px-2.5 text-[11px] font-semibold text-gray-600 border-none outline-none"
                >
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>

              {/* Chart & Legend Row */}
              <div className="flex items-center justify-between mt-3">
                {/* Donut Chart stage */}
                <div className="w-32 h-32 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={activeDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={52}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {activeDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text displaying spent total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[14px] font-black text-gray-800 font-sans">
                      ₹{totalSpent}
                    </span>
                    <span className="text-[8px] text-gray-400 font-medium font-sans uppercase">
                      Total Spent
                    </span>
                  </div>
                </div>

                {/* Right Side Categories totals */}
                <div className="flex-1 pl-4 space-y-2 max-h-34 overflow-y-auto">
                  {categories.map((cat) => {
                    const spent = state.expenses
                      .filter((e) => e.category === cat)
                      .reduce((sum, e) => sum + e.amount, 0);

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colorsMap[cat] }}
                          />
                          <span className="text-gray-500 font-medium font-sans">
                            {cat}
                          </span>
                        </div>
                        <span className="font-bold text-gray-800 font-sans">
                          ₹{spent.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Quick Action Grid section */}
          <div className="px-6 mt-5 mb-8">
            <h4 className="text-white font-extrabold text-sm mb-3 font-sans tracking-wide">
              Quick Action
            </h4>

            <div className="grid grid-cols-4 gap-3">
              {/* Add Expense (Purple) */}
              <button
                id="btn-quick-add-expense"
                onClick={() => navigate("/add-expense")}
                className="bg-[#786bc2] hover:bg-[#685bb2] text-white p-3.5 rounded-2xl shadow-md flex flex-col items-center justify-center space-y-2 aspect-square transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black tracking-tight text-center leading-none">
                  Add Expense
                </span>
              </button>

              {/* Add Income (Green) */}
              <button
                id="btn-quick-add-income"
                onClick={() => setShowIncomeModal(true)}
                className="bg-[#82ca79] hover:bg-[#72ba69] text-[#0e162f] p-3.5 rounded-2xl shadow-md flex flex-col items-center justify-center space-y-2 aspect-square transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="p-1 bg-[#0e162f]/15 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-[#0e162f]" />
                </div>
                <span className="text-[10px] font-black tracking-tight text-center leading-none">
                  Add Income
                </span>
              </button>

              {/* View Report (Light Teal Blue) */}
              <button
                id="btn-quick-view-report"
                onClick={() => navigate("/reports")}
                className="bg-[#8ccad2] hover:bg-[#7cbac2] text-[#0e162f] p-3.5 rounded-2xl shadow-md flex flex-col items-center justify-center space-y-2 aspect-square transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="p-1 bg-[#0e162f]/15 rounded-lg">
                  <FileBarChart className="w-4 h-4 text-[#0e162f]" />
                </div>
                <span className="text-[10px] font-black tracking-tight text-center leading-none">
                  View Report
                </span>
              </button>

              {/* Set Budget (Orange-Red / Coral) */}
              <button
                id="btn-quick-set-budget"
                onClick={() => navigate("/set-budget")}
                className="bg-[#e68a73] hover:bg-[#d67a63] text-white p-3.5 rounded-2xl shadow-md flex flex-col items-center justify-center space-y-2 aspect-square transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <Sliders className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black tracking-tight text-center leading-none">
                  Set Budget
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Reusable Bottom Navigation */}
        <BottomNavigation />

        {/* 5. INCOME ADD MODAL */}
        {showIncomeModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-slide-up border-t border-gray-100 max-w-md">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                  Add Student Allowance / Income
                </h3>
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleIncomeSubmit} className="mt-4 space-y-4">
                {/* Amount input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      id="income-amount-input"
                      type="number"
                      value={incAmount}
                      onChange={(e) => setIncAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full py-3.5 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-base font-bold text-gray-800"
                      required
                      min="1"
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Source description
                  </label>
                  <input
                    id="income-source-input"
                    type="text"
                    value={incSource}
                    onChange={(e) => setIncSource(e.target.value)}
                    placeholder="e.g. Monthly Allowance, Freelance Writing"
                    className="w-full py-3 pl-4 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-semibold text-gray-700"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Received Date
                  </label>
                  <input
                    id="income-date-input"
                    type="date"
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full py-3 pl-4 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-semibold text-gray-700"
                    required
                  />
                </div>

                {/* Submit button */}
                <button
                  id="income-save-btn"
                  type="submit"
                  className="w-full py-4 bg-[#33d69f] hover:bg-[#25ca90] text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer mt-2 leading-none"
                >
                  Save Allowance
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* BUDGET MODAL */}
        <SetBudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} />
      </div>
    </div>
  );
};
