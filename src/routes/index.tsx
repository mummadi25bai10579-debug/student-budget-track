import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';

// Import Pages
import { WelcomeScreen } from '../pages/WelcomeScreen';
import { LoginScreen } from '../pages/LoginScreen';
import { SignUpScreen } from '../pages/SignUpScreen';
import { ForgotPasswordScreen } from '../pages/ForgotPasswordScreen';
import { EmailVerificationScreen } from '../pages/EmailVerificationScreen';
import { DashboardScreen } from '../pages/DashboardScreen';
import { AddExpenseScreen } from '../pages/AddExpenseScreen';
import { SetBudgetScreen } from '../pages/SetBudgetScreen';
import { ReportsScreen } from '../pages/ReportsScreen';
import { NotificationsScreen } from '../pages/NotificationsScreen';
import { ProfileScreen } from '../pages/ProfileScreen';
import { ExpensesScreen } from '../pages/ExpensesScreen';
import { SettingsScreen } from '../pages/SettingsScreen';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAppState();
  
  console.log("ROUTE CHECK", { 
    isLoggedIn: state.isLoggedIn, 
    authLoading: state.authLoading,
    isProfileLoaded: state.isProfileLoaded,
    pathname: window.location.hash
  });

  if (state.authLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!state.isLoggedIn) {
    console.log("REDIRECT TO LOGIN - User not logged in");
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { state } = useAppState();

  return (
    <Routes>
      {/* Universal Welcome / Splash Entry */}
      <Route path="/" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <WelcomeScreen />} />
      <Route path="/login" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
      <Route path="/signup" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUpScreen />} />
      <Route path="/email-verification" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <EmailVerificationScreen />} />
      <Route path="/forgot-password" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <ForgotPasswordScreen />} />

      {/* Protected Student Screens */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <AddExpenseScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/set-budget"
        element={
          <ProtectedRoute>
            <SetBudgetScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesScreen />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
