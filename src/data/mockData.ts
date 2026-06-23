import { AppState, Expense, Income, AppNotification, UserProfile } from '../types';

export const initialProfile: UserProfile = {
  name: 'Rohit',
  course: 'BTech Computer Science',
  university: 'VIT University',
  email: 'RohitSarma624@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', // high-quality placeholder matching the male cartoon Avatar
  budget: null,
};

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    name: 'College Lunch Buffet',
    amount: 1500,
    category: 'Food',
    date: '2026-06-21',
    notes: 'Weekly hostel lunch combo',
  },
  {
    id: 'exp_2',
    name: 'Burger & Fries',
    amount: 800,
    category: 'Food',
    date: '2026-06-20',
    notes: 'Snack at cafe with project group',
  },
  {
    id: 'exp_3',
    name: 'Cab to Campus',
    amount: 450,
    category: 'Transport',
    date: '2026-06-15',
    notes: 'Late for physics lab',
  },
  {
    id: 'exp_4',
    name: 'Bus Monthly Pass',
    amount: 800,
    category: 'Transport',
    date: '2026-06-19',
    notes: 'Regular transport concession card',
  },
  {
    id: 'exp_5',
    name: 'Winter Hoodie',
    amount: 1100,
    category: 'Shopping',
    date: '2026-06-12',
    notes: 'VIT CS department merch',
  },
  {
    id: 'exp_6',
    name: 'Engineering Physics Book',
    amount: 1100,
    category: 'Education',
    date: '2026-06-14',
    notes: 'Semester reference book',
  }
];

export const initialIncomes: Income[] = [
  {
    id: 'inc_1',
    amount: 10000,
    source: 'Monthly Allowance',
    date: '2026-06-01',
  },
  {
    id: 'inc_2',
    amount: 5000,
    source: 'Freelance Design gig',
    date: '2026-06-18',
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'alert',
    title: 'Budget Alert',
    message: 'You have spent 80% of your Food budget.',
    timestamp: '10:30 AM',
    category: 'Food',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'alert',
    title: 'Budget Alert',
    message: 'You have spent 90% of your Shopping budget.',
    timestamp: 'Yesterday',
    category: 'Shopping',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'info',
    title: 'Budget Alert',
    message: 'Monthly budget limit is approaching.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'update',
    title: 'Income Added',
    message: 'Your income of ₹5,000 has been added.',
    timestamp: '3 days ago',
    read: true,
  },
];

export const defaultState: AppState = {
  expenses: [],
  incomes: [],
  budget: null,
  profile: {
    name: '',
    course: '',
    university: '',
    email: '',
    avatarUrl: '',
    budget: null
  },
  notifications: [],
  isLoggedIn: false,
  isProfileLoaded: false,
  authLoading: true,
  isLoading: false,
};
