export type Category = 'Food' | 'Transport' | 'Shopping' | 'Education' | 'Entertainment';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
}

export interface BudgetData {
  monthlyBudget: number;
  categoryBudgets: Record<Category, number>;
  totalSpent: number;
}

export interface UserProfile {
  name: string;
  course: string;
  university: string;
  email: string;
  avatarUrl: string;
  budget: BudgetData | null;
}

export interface AppNotification {
  id: string;
  type: 'alert' | 'update' | 'info';
  title: string;
  message: string;
  timestamp: string;
  category?: Category;
  read: boolean;
}

export interface AppState {
  expenses: Expense[];
  incomes: Income[];
  budget: BudgetData | null;
  profile: UserProfile;
  notifications: AppNotification[];
  isLoggedIn: boolean;
  isProfileLoaded: boolean;
  authLoading: boolean;
  isLoading: boolean;
}
