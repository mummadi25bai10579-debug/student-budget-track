# 🏆 Design2Code 2.0: Master Implementation Blueprint
**Student Expense & Budget Tracker**

As your Product Manager, UX Lead, and Hackathon Mentor, I have reviewed the wireframes. This document serves as your definitive architectural blueprint and execution roadmap to maximize your score.

---

## 📱 1. Screen-by-Screen Analysis

### Screen 1: Welcome / Splash Screen
*   **Purpose**: Brand introduction, seamless initialization, and asset warming.
*   **User Goal**: Confirm application launch and experience brand identity.
*   **Inputs**: None (automated).
*   **Outputs**: Initial branding, illustration.
*   **Navigation**: Auto-redirect after ~2500ms to `/login` (if unauthenticated) or `/dashboard` (if authenticated).
*   **State Changes**: `appInitialize` effect.
*   **LocalStorage Data**: Read `auth_session` to determine the routing dest.
*   **Validation Rules**: N/A.

### Screen 2: Login
*   **Purpose**: Secure user entry.
*   **User Goal**: Authenticate quickly to access personal financial data.
*   **Inputs**: `email` (email type), `password` (obscured), `rememberMe` (boolean), Social Login Triggers.
*   **Outputs**: Validation errors, success toasts.
*   **Navigation**: On successful auth → `/dashboard`; On Forgot Password → `/forgot-password`.
*   **State Changes**: Update global `AuthContext` (`{ isAuthenticated: true }`).
*   **LocalStorage Data**: Store mock JWT or user object (`currentUser`).
*   **Validation Rules**: Standard regex for email, Password length ≥ 6.

### Screen 3: Dashboard
*   **Purpose**: The primary hub offering immediate financial clarity.
*   **User Goal**: Instantly know "How much money do I have left?" and view recent activities.
*   **Inputs**: Tab Navigation, "Add" trigger.
*   **Outputs**: Total Remaining Balance, Top 3 Recent Expenses, Visual Progress Indicator (e.g., circular progress).
*   **Navigation**: Central hub connecting to all primary views (`/add-expense`, `/budget`, `/reports`).
*   **State Changes**: Real-time aggregation of current month's expenses.
*   **LocalStorage Data**: Read `expenses` list, Read `monthly_budget_cap`.
*   **Validation Rules**: If `Total Spent > Monthly Budget`, transition progress bar color to red (Warning State).

### Screen 4: Add Expense
*   **Purpose**: Fast, frictionless data entry.
*   **User Goal**: Log a transaction before forgetting it.
*   **Inputs**: `amount` (numeric float), `name` (string), `category` (dropdown), `date` (date picker, defaults to today), `notes` (optional text).
*   **Outputs**: Success feedback (Toast).
*   **Navigation**: "Save" → `goBack()` or `/dashboard`.
*   **State Changes**: Append new object to `expenses` array in `BudgetContext`.
*   **LocalStorage Data**: Write updated `expenses` array.
*   **Validation Rules**: Amount must be > 0. Category is required. Name is required.

### Screen 5: Budget Management
*   **Purpose**: Financial parameter definition.
*   **User Goal**: Set boundaries for distinct spending categories to prevent overspending.
*   **Inputs**: Input fields or sliders for categories (Food, Transport, Ed, Shopping, Ent).
*   **Outputs**: Calculated sum of category budgets vs. Global Monthly Budget.
*   **Navigation**: Save/Back → `/dashboard`.
*   **State Changes**: Update `category_limits` object.
*   **LocalStorage Data**: Write `category_limits`.
*   **Validation Rules**: Individual category values cannot be negative. Warn if sum of category budgets exceeds the stated Global Monthly Budget.

### Screen 6: Reports & Analytics
*   **Purpose**: Deep-dive financial visualization.
*   **User Goal**: Discover spending trends and largest expense areas.
*   **Inputs**: Segment selector (Weekly / Monthly / Yearly).
*   **Outputs**: Pie Chart (Breakdown by Category), Line Chart (Spending over time).
*   **Navigation**: Accessed via Bottom Tab / Navigation menu.
*   **State Changes**: UI filtering state `time_filter`.
*   **LocalStorage Data**: Read-only `expenses` array, grouped by date/category dynamically.
*   **Validation Rules**: If array is empty for chosen filter, show Empty State.

### Screen 7: Notifications
*   **Purpose**: Proactive alerting.
*   **User Goal**: Get notified *before* breaking the budget.
*   **Inputs**: "Mark as Read", "Clear All".
*   **Outputs**: Feed of alerts.
*   **Navigation**: Tapping an alert deep-links to `/budget` or `/reports`.
*   **State Changes**: Update `isRead` flag on message objects.
*   **LocalStorage Data**: Array of `notifications`.
*   **Validation Rules**: Notifications generated on app-load or expense-add if specific threshold criteria are met.

### Screen 8: Profile
*   **Purpose**: User management and settings.
*   **User Goal**: Manage profile, access help, or export data.
*   **Inputs**: Avatar upload (mock), Currency selector, Export Trigger, Logout.
*   **Outputs**: CSV Data Blob download, Theme shifts.
*   **Navigation**: Logout → `/login`.
*   **State Changes**: Clear global state on logout.
*   **LocalStorage Data**: Clear user token on logout. Update preferences.
*   **Validation Rules**: Secondary confirmation Modal before logging out or clearing data.

---

## 🏗️ 2. Comprehensive System Architecture

### A. Complete User Flow
`Splash Screen` → determines auth → `Login` → upon success → `Dashboard`.
From `Dashboard`, user navigates via a **persistent bottom navigation bar** (Mobile standard) to `Reports`, `Profile`, and `Notifications`. A central, prominent **Floating Action Button (FAB)** opens the `Add Expense` modal or screen.

### B. App Architecture
*   **Framework**: React 18.x + Vite (Lightning fast HMR).
*   **Routing**: `react-router-dom` (v6) with browser router.
*   **Styling**: Tailwind CSS (Mobile-first responsive utilities).
*   **Icons**: `lucide-react` (clean, wireframe-accurate vectors).
*   **Data Viz**: `recharts` (Lightweight, SVG-based, easy to style to wireframe).
*   **Component Pattern**: Container-Presenter separation.

### C. Component Structure
*   **Atoms**: `Button`, `Input`, `Select`, `Card`, `ProgressBar`, `Avatar`
*   **Molecules**: `ExpenseItem`, `CategoryBudgetInput`, `StatCard`, `NotificationRow`
*   **Organisms**: `BottomTabBar`, `TopHeader`, `PieChartWidget`, `ExpenseForm`
*   **Templates**: `MobileContainer` (Restricts width on desktop to simulate mobile bounds:`w-full max-w-md mx-auto min-h-screen relative shadow-2xl`).

### D. Folder Structure
```text
/src
 ├── assets/          # SVGs, Illustrations (Student, Wallet)
 ├── components/      # Shared Atoms/Molecules
 │   ├── ui/          # Generic inputs, buttons, cards
 │   └── layout/      # TabBar, Header, MobileViewWrapper
 ├── context/         # React Context (AuthContext.tsx, BudgetContext.tsx)
 ├── hooks/           # Custom localstorage sync hooks
 ├── pages/           # Page level components (Dashboard.tsx, etc.)
 ├── utils/           # Math formulas, Date formatting, Currency formatting
 └── App.tsx          # Router definition
```

### E. React Context Structure
Use a unified `BudgetContext` to avoid prop drilling:
```typescript
interface AppState {
  expenses: Expense[];
  monthlyBudget: number;
  categoryLimits: Record<string, number>;
  notifications: AppNotification[];
}
```

### F. LocalStorage Schema
```json
{
  "user_session": { "id": "1", "name": "Student", "currency": "USD" },
  "app_data": {
    "expenses": [{"id": "a1", "amt": 12.50, "cat": "Food", "date": "2023-11-01", "note": "Lunch"}],
    "budget": 500,
    "categoryLimits": { "Food": 200, "Transport": 100 }
  }
}
```

### G. Route Definitions
*   `/` - Welcome
*   `/login` - Login
*   `/app` - Layout Wrapper with Bottom Tab Bar
    *   `/app/dashboard` - Main Dashboard
    *   `/app/reports` - Charts
    *   `/app/budget` - Category caps
    *   `/app/notifications` - Alerts feed
    *   `/app/profile` - Settings
*   `/add-expense` - Full screen take-over / outside tab bar context.

### H. Dynamic Calculations
*   **Total Spent**: `expenses.reduce((sum, e) => sum + e.amount, 0)` (filtered to current month).
*   **Remaining**: `budget - totalSpent` (Clamp to 0 if negative, show overage).
*   **Progress %**: `(totalSpent / monthlyBudget) * 100`.

### I. Notification Logic
Fire a check strictly within `Add Expense` successful submission:
```typescript
if (newTotalForCategory >= categoryLimit * 0.9) {
   generateNotification(`Warning: You have reached 90% of your ${category} budget!`);
}
```

### J. Chart Logic
Use `recharts`. Transform flat `expenses` array to `{ name: "Food", value: 120 }` using a utility function (`groupExpensesByCategory()`) before passing it to `<PieChart>`.

### K. Edge Cases Handled
*   *Huge numbers*: Text overflow clipping using Tailwind `truncate`.
*   *Past months UI*: Dropdown in reports to ensure data only compares against the correct time bounds.
*   *Zero data*: Prevent division by zero when calculating Progress % (default to 0).

### L. Empty States
*   **Dashboard**: Illustration of an empty wallet "No expenses logged today. You're doing great!"
*   **Reports**: "Log your first expense to see analytics."

### M. Error States
*   Forms: Red outlines (`ring-red-500`) with microcopy text below inputs if validation fails.

### N. Loading States
*   Using simple skeleton pulses (`animate-pulse bg-gray-200 rounded`) while calculating state on Dashboard mount to mimic fetching, enhancing perceived performance.

### O. Hackathon Winning Enhancements (Preserving Wireframe)
1.  **Haptic Feedback**: Use `navigator.vibrate([50])` on successful expense add (supported on Android/PWA).
2.  **Number Animations**: Use `framer-motion` or simple CSS counters to make the Dashboard remaining balance "roll up" visually on load.
3.  **Intl Formatting**: Native formatting for currency so it looks utterly professional (`new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(val)`).

---

## 🏆 3. Hackathon Strategy & Roadmap

### Development Roadmap

*   **Day 1: Foundation, State & Dashboard**
    *   Setup React, Vite, Tailwind, & `MobileContainer`.
    *   Define Routes, Stubs, & Navigation flow.
    *   Implement `BudgetContext` & `useLocalStorage`.
    *   Build `Dashboard` & basic data calculations.
*   **Day 2: Features, Polish & Persona**
    *   `Add Expense` Form + `Reports` Charts + Notifications.
    *   Map typography, colors, padding (Wireframe accuracy).
    *   Empty states, toasts, `framer-motion` transitions.

