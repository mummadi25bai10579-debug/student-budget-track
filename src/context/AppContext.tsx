import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Expense, Income, Category, AppNotification, UserProfile, BudgetData } from '../types';
import { defaultState } from '../data/mockData';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, collection, query, getDocs, setDoc } from 'firebase/firestore';

interface AppContextType {
  state: AppState;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addIncome: (amount: number, source: string, date: string) => void;
  updateBudgetLimit: (category: Category, amount: number) => void;
  updateProfile: (profile: UserProfile) => void;
  saveBudget: (budget: BudgetData) => Promise<void>;
  logout: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  forceLogin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => ({
    ...defaultState,
    isLoading: true
  }));
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Clear old legacy un-keyed state to avoid confusion
    localStorage.removeItem('student_tracker_state');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AUTH STATE CHANGED", user ? "USER DETECTED" : "NO USER");
      if (user) {
        console.log("USER UID", user.uid);
        console.log("LOGIN UID:", user.uid);
        console.log("LOGIN EMAIL:", user.email);
        console.log("CURRENT AUTH UID:", user.uid);
        console.log("CURRENT AUTH EMAIL:", user.email);
        console.log("ACTIVE USER EMAIL:", user.email);
        console.log("ACTIVE USER UID:", user.uid);
        const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');

        if (!isGoogle && !user.emailVerified) {
          console.log("[AppContext] Auth state changed. User is not verified. Treating as logged out.");
          setState(() => ({ 
            ...defaultState, 
            isLoggedIn: false, 
            authLoading: false 
          }));
          setAuthInitialized(true);
          return;
        }

        // 1. Force fresh fetch: Skip cached state loading for now or ensure it matches UID
        console.log("FORCING FRESH FETCH");
        let loadedState = defaultState;

        console.log("LOGIN SUCCESS");

        // 4. Fetch/Sync Firestore profile
        try {
          console.log("FETCHING PROFILE");
          console.log("READING FROM UID:", user.uid);
          const docPromise = getDoc(doc(db, "users", user.uid));
          const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 5000));
          const userDoc = await Promise.race([docPromise, timeoutPromise]);
          
          let budget: BudgetData | null = null;
          let firestoreProfileData: Partial<UserProfile> = {};
          let fetchedExpenses: Expense[] = [];
          let fetchedIncomes: Income[] = [];
          let fetchedNotifications: AppNotification[] = [];

          if (userDoc.exists()) {
            const docData = userDoc.data();
            
            // Fetch expenses, income, notifications
            console.log("FETCHING DATA");
            console.log("READING FROM UID:", user.uid);
            
            const expensesSnapshot = await getDocs(query(collection(db, "users", user.uid, "expenses")));
            expensesSnapshot.forEach((doc) => {
                fetchedExpenses.push(doc.data() as Expense);
            });
            const totalSpent = fetchedExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            const incomesSnapshot = await getDocs(query(collection(db, "users", user.uid, "income")));
            incomesSnapshot.forEach((doc) => {
                fetchedIncomes.push(doc.data() as Income);
            });
            
            const notifsSnapshot = await getDocs(query(collection(db, "users", user.uid, "notifications")));
            notifsSnapshot.forEach((doc) => {
                fetchedNotifications.push(doc.data() as AppNotification);
            });

            console.log("EXPENSE DATA:", fetchedExpenses);
            console.log("INCOME DATA:", fetchedIncomes);
            console.log("NOTIFICATION DATA:", fetchedNotifications);
            
            budget = docData.budget as BudgetData || null;
            if (budget) {
                budget.totalSpent = totalSpent;
            }
            console.log("BUDGET DATA:", budget);
            console.log("LOAD COMPLETE");

            firestoreProfileData = {
              name: docData.name || docData.username || docData.displayName || user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              email: docData.email || user.email || '',
              avatarUrl: docData.photoURL || user.photoURL || '',
              course: docData.course || '',
              university: docData.university || '',
              budget: budget,
            };
          } else {
            // ... (keep the existing creation logic for new user)
            // Need to handle the case where userDoc doesn't exist
            // Actually, the previous code block for userDoc.exists() has a closing brace.
            // I need to be careful with the merge.
            console.log("[AppContext] User doc does not exist in Firestore. Creating entry on the fly...");
            console.log("REASON DOCUMENT MISSING: Not found during initial fetch at login/refresh.");
            const { setDoc } = await import("firebase/firestore");
            const provider = isGoogle ? 'google' : user.providerData.some((p: any) => p.providerId === 'facebook.com') ? 'facebook' : 'email';
            const newDoc = {
              uid: user.uid,
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              name: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              username: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              email: user.email || '',
              photoURL: user.photoURL || '',
              provider: provider,
              budget: null,
              createdAt: serverTimestamp(),
            };
            console.log("FIRESTORE RECOVERY WRITE PAYLOAD:", newDoc);
            const setDocPromise = setDoc(doc(db, "users", user.uid), newDoc, { merge: true });
            await Promise.race([setDocPromise, timeoutPromise]);
            
            firestoreProfileData = {
              name: newDoc.name,
              email: newDoc.email,
              avatarUrl: newDoc.photoURL,
              course: '',
              university: '',
              budget: null,
            };
            budget = null;
          }
          console.log("USERNAME FOUND:", firestoreProfileData.name);
          console.log("PROFILE LOADED");

        // 2. Set state after profile is ready
        setState((prev) => ({
          ...prev,
          expenses: fetchedExpenses,
          incomes: fetchedIncomes,
          notifications: fetchedNotifications,
          budget: budget,
          profile: {
            ...prev.profile,
            ...firestoreProfileData,
          },
          isLoggedIn: true,
          isProfileLoaded: true,
          authLoading: false,
          isLoading: false
        }));
        setAuthInitialized(true);
        console.log("FINAL HYDRATED STATE:", {
          expenses: fetchedExpenses,
          incomes: fetchedIncomes,
          notifications: fetchedNotifications,
          budget: budget,
          profile: firestoreProfileData
        });
        console.log("LOAD COMPLETE");

        } catch (err: any) {
          console.warn("[AppContext] Profile fetch/sync failed:", err?.message || err);
          
          const fallbackProfile: UserProfile = {
            ...loadedState.profile,
            name: loadedState.profile.name || user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
            email: loadedState.profile.email || user.email || '',
            avatarUrl: loadedState.profile.avatarUrl || user.photoURL || '',
          };

        // Fallback to loaded state
        setState((prev) => ({
          ...prev,
          ...loadedState,
          profile: fallbackProfile,
          isLoggedIn: true,
          isProfileLoaded: true,
          authLoading: false,
        }));
        setAuthInitialized(true);
      }
    } else {
      console.log("AUTH STATE CHANGED", "NO USER");
      setState((prev) => ({ 
        ...prev, 
        isLoggedIn: false, 
        authLoading: false 
      }));
      setAuthInitialized(true);
    }
  });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authInitialized && state.isLoggedIn && auth.currentUser) {
      const userKey = `student_tracker_state_${auth.currentUser.uid}`;
      localStorage.setItem(userKey, JSON.stringify(state));
    }
  }, [state, authInitialized]);

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    console.log("SAVING EXPENSE", expenseData);
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };

    // Calculate current category spent
    const categorySpentBefore = state.expenses
      .filter((e) => e.category === expenseData.category)
      .reduce((sum, e) => sum + e.amount, 0);

    const categorySpentAfter = categorySpentBefore + expenseData.amount;
    const currentLimit = state.budget?.categoryBudgets[expenseData.category] || 0;

    const newNotifications = [...state.notifications];

    // Notification Trigger logic:
    // Alert levels: 80% (Warning), 90% (Critical Warning), 100% (Budget Reached), >100% (Budget Exceeded)
    if (currentLimit > 0) {
      const percentBefore = Math.round((categorySpentBefore / currentLimit) * 100);
      const percentAfter = Math.round((categorySpentAfter / currentLimit) * 100);

      let alertType = '';
      let message = '';

      if (percentBefore < 80 && percentAfter >= 80 && percentAfter < 90) {
        alertType = 'Warning';
        message = `You have spent ${percentAfter}% of your ${expenseData.category} budget.`;
      } else if (percentBefore < 90 && percentAfter >= 90 && percentAfter < 100) {
        alertType = 'Critical Warning';
        message = `You have spent ${percentAfter}% of your ${expenseData.category} budget.`;
      } else if (percentBefore < 100 && percentAfter === 100) {
        alertType = 'Budget Reached';
        message = `You have fully used your ${expenseData.category} budget.`;
      } else if (percentBefore < 100 && percentAfter > 100) {
        alertType = 'Budget Exceeded';
        message = `You have exceeded your ${expenseData.category} budget by ${percentAfter - 100}%.`;
      }

      if (alertType) {
        console.log("CATEGORY:", expenseData.category);
        console.log("SPENT:", categorySpentAfter);
        console.log("LIMIT:", currentLimit);
        console.log("USAGE_PERCENT:", percentAfter);
        console.log("ALERT_TYPE:", alertType);

        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          type: 'alert',
          title: alertType,
          message: message,
          timestamp: 'Just now',
          category: expenseData.category,
          read: false,
        };
        newNotifications.unshift(newNotif);
      }
    }

    // Update total spent in budget
    const updatedBudget = state.budget ? {
      ...state.budget,
      totalSpent: state.budget.totalSpent + expenseData.amount
    } : null;

    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      notifications: newNotifications,
      budget: updatedBudget,
      profile: {
        ...prev.profile,
        budget: updatedBudget
      }
    }));
    
    // Save updated budget if it exists
    if (updatedBudget && auth.currentUser) {
        console.log("WRITING BUDGET TO UID:", auth.currentUser.uid);
        try {
          const { setDoc, doc } = await import("firebase/firestore");
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            budget: updatedBudget,
          }, { merge: true });
        } catch (e) {
          console.error("BUDGET SAVE FAILED", e);
        }
    }

    // Save expense to Firestore
    if (auth.currentUser) {
        console.log("WRITING EXPENSE TO UID:", auth.currentUser.uid);
        try {
          const { setDoc, doc } = await import("firebase/firestore");
          await setDoc(doc(db, "users", auth.currentUser.uid, "expenses", newExpense.id), {
            ...newExpense,
            notes: newExpense.notes || null
          });
        console.log("EXPENSE SAVE SUCCESS");
        console.log("EXPENSE SAVED:", newExpense.id);
      } catch (e) {
        console.error("EXPENSE SAVE FAILED", e);
        console.error("FIRESTORE SAVE ERROR", e);
      }
    }
  };

  const addIncome = async (amount: number, source: string, date: string) => {
    console.log("SAVING INCOME", { amount, source, date });
    const newIncome: Income = {
      id: `inc_${Date.now()}`,
      amount,
      source,
      date,
    };

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_inc`,
      type: 'update',
      title: 'Income Added',
      message: `Your income of ₹${amount.toLocaleString('en-IN')} has been added.`,
      timestamp: 'Just now',
      read: false,
    };

    setState((prev) => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
      notifications: [newNotif, ...prev.notifications],
    }));

    if (auth.currentUser) {
      try {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", auth.currentUser.uid, "income", newIncome.id), newIncome);
        await setDoc(doc(db, "users", auth.currentUser.uid, "notifications", newNotif.id), newNotif);
        console.log("INCOME SAVE SUCCESS");
      } catch (e) {
        console.error("INCOME/NOTIF SAVE FAILED", e);
        console.error("FIRESTORE SAVE ERROR", e);
      }
    }
  };

  const updateBudgetLimit = async (category: Category, amount: number) => {
    const newLimits = {
      ...state.budgetLimits,
      [category]: amount,
    };
    setState((prev) => ({
      ...prev,
      budgetLimits: newLimits
    }));
    
    if (auth.currentUser && state.budget) {
      console.log("SAVING BUDGET", state.budget);
      try {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          budget: { ...state.budget, categoryBudgets: newLimits }
        }, { merge: true });
        console.log("BUDGET SAVE SUCCESS");
      } catch (e) {
        console.error("FIRESTORE SAVE ERROR", e);
      }
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    setState((prev) => ({
      ...prev,
      profile,
    }));
    if (auth.currentUser) {
      console.log("WRITING TO UID:", auth.currentUser.uid);
      try {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          displayName: profile.name,
          name: profile.name,
          email: profile.email,
          course: profile.course,
          university: profile.university,
          photoURL: profile.avatarUrl || "",
        }, { merge: true });
        console.log("[AppContext] Profile successfully synchronized to Firestore.");
      } catch (err: any) {
        console.warn("[AppContext] Error updating profile in Firestore (might be offline):", err?.message || err);
      }
    }
  };

  const saveBudget = async (budget: BudgetData) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    console.log("SAVE UID:", uid);
    console.log("SAVE PATH:", `users/${uid}`);
    console.log("SAVE DATA:", { budget });

    setState((prev) => ({
      ...prev,
      budget: budget,
      profile: {
        ...prev.profile,
        budget: budget,
      },
    }));

    if (auth.currentUser) {
      console.log("WRITING TO UID:", auth.currentUser.uid);
      try {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          budget: budget,
        }, { merge: true });
        console.log("SAVE SUCCESS: true");
        console.log("BUDGET SAVE SUCCESS");
      } catch (err: any) {
        console.log("SAVE SUCCESS: false");
        console.error("FIRESTORE SAVE ERROR", err);
      }
    }
  };


  const logout = async () => {
    console.log("LOGOUT CLEARING STATE");
    
    // Clear all state to default
    setState(defaultState);
    
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    console.log("LOGOUT COMPLETE");

    try {
      await signOut(auth);
    } catch (error: any) {
      console.warn("Firebase logout error:", error.message);
    }
  };

  const markNotificationRead = async (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    
    if (auth.currentUser) {
        try {
            const { updateDoc, doc } = await import("firebase/firestore");
            await updateDoc(doc(db, "users", auth.currentUser.uid, "notifications", id), { read: true });
        } catch (e) {
            console.error("NOTIFICATION UPDATE FAILED", e);
        }
    }
  };

  const clearAllNotifications = async () => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
    
    if (auth.currentUser) {
        try {
            const { writeBatch, collection, query, getDocs, doc } = await import("firebase/firestore");
            const batch = writeBatch(db);
            const snapshot = await getDocs(query(collection(db, "users", auth.currentUser.uid, "notifications")));
            snapshot.forEach((d) => batch.delete(d.ref));
            await batch.commit();
        } catch (e) {
            console.error("NOTIFICATION CLEAR FAILED", e);
        }
    }
  };

  const forceLogin = () => {
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      authLoading: false,
    }));
  };

  if (!authInitialized) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        state,
        addExpense,
        addIncome,
        updateBudgetLimit,
        updateProfile,
        saveBudget,
        logout,
        markNotificationRead,
        clearAllNotifications,
        forceLogin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
