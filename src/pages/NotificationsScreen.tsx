import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { AppNotification } from '../types';
import { ArrowLeft, AlertTriangle, AlertCircle, Sparkles, CheckCircle, Flame, Mail, Trash2 } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';

type FilterType = 'all' | 'alerts' | 'updates';

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, markNotificationRead, clearAllNotifications } = useAppState();

  const [filter, setFilter] = useState<FilterType>('all');

  const filteredNotifications = state.notifications.filter((n) => {
    if (filter === 'alerts') {
      return n.type === 'alert' || n.type === 'info';
    }
    if (filter === 'updates') {
      return n.type === 'update';
    }
    return true;
  });

  const alertsCount = state.notifications.filter((n) => n.type === 'alert' || n.type === 'info').length;

  const getIcon = (type: string, category?: string) => {
    switch (type) {
      case 'alert':
        if (category === 'Shopping') {
          return (
            <div className="w-11 h-11 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-sm flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          );
        }
        return (
          <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'info':
        return (
          <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'update':
        return (
          <div className="w-11 h-11 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shadow-sm flex-shrink-0">
            <Mail className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport with cyan background styling as seen in Wireframe 7 */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#26cbdc] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100">
        
        <div className="flex-1 flex flex-col">
          
          {/* Header Row */}
          <div className="px-6 pt-6 pb-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <button
                id="notif-back-btn"
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold tracking-tight font-sans">Notification</h2>
            </div>

            {state.notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* 1. Filter layout Row */}
          <div id="notif-tabs" className="px-6 pb-5 flex gap-3.5">
            <button
              id="notif-tab-all"
              onClick={() => setFilter('all')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${
                filter === 'all'
                  ? 'bg-purple-100 text-[#7c5dfa] shadow-md font-extrabold'
                  : 'bg-white/25 text-white hover:bg-white/35'
              }`}
            >
              All
            </button>

            <button
              id="notif-tab-alerts"
              onClick={() => setFilter('alerts')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${
                filter === 'alerts'
                  ? 'bg-blue-100 text-[#1ea1f2] shadow-md font-extrabold'
                  : 'bg-white/25 text-white hover:bg-white/35'
              }`}
            >
              Alerts <span className="ml-0.5 text-[10px] px-1 bg-red-500 rounded-full text-white">{alertsCount}</span>
            </button>

            <button
              id="notif-tab-updates"
              onClick={() => setFilter('updates')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${
                filter === 'updates'
                  ? 'bg-purple-100 text-[#7c5dfa] shadow-md font-extrabold'
                  : 'bg-white/25 text-white hover:bg-white/35'
              }`}
            >
              Updates
            </button>
          </div>

          {/* 2. Soft white curved card list covering the screen */}
          <div className="flex-1 bg-slate-50/90 rounded-t-[32px] p-5 space-y-3.5 overflow-y-auto max-h-[500px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 text-gray-400">
                <CheckCircle className="w-12 h-12 text-gray-300 stroke-[1.5] mb-2" />
                <p className="text-sm font-bold">No notifications found</p>
                <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-4 bg-white rounded-2xl shadow-sm border flex xl:items-start items-center space-x-4 transition-all hover:shadow-md cursor-pointer ${
                    !n.read ? 'border-blue-200 bg-blue-50/15' : 'border-gray-100'
                  }`}
                >
                  {/* Category warning/info Icon */}
                  {getIcon(n.type, n.category)}

                  {/* Body textual content */}
                  <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-gray-800 tracking-tight font-sans">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 font-sans tracking-wide">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-normal font-sans">
                      {n.message}
                    </p>
                    
                    {!n.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Home tabs bottom bar */}
        <BottomNavigation />
        
      </div>
    </div>
  );
};
