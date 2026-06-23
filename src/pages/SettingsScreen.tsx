import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import {
  ArrowLeft,
  Bell,
  BellOff,
  User,
  LogOut,
  Mail,
  BookOpen,
  School,
  ShieldAlert,
} from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";
import { toast } from "react-hot-toast";

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAppState();

  const [notificationsMuted, setNotificationsMuted] = useState(() => {
    return localStorage.getItem("settings_notifications_muted") === "true";
  });

  useEffect(() => {
    localStorage.setItem("settings_notifications_muted", String(notificationsMuted));
  }, [notificationsMuted]);

  const handleToggleNotifications = () => {
    setNotificationsMuted(!notificationsMuted);
    toast.success(
      !notificationsMuted
        ? "Notifications muted!"
        : "Notifications enabled!",
    );
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport simulator in Indigo Theme */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#6366f1] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100">
        <div className="flex-1 flex flex-col">
          {/* Header Row */}
          <div className="px-6 pt-6 pb-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <button
                id="settings-back-btn"
                onClick={() => navigate("/profile")}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold tracking-tight font-sans">
                Settings
              </h2>
            </div>
          </div>

          {/* Settings contents wrapper */}
          <div className="flex-1 bg-slate-50/95 rounded-t-[32px] p-5 space-y-5 overflow-y-auto">
            
            {/* Notifications Toggle */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notificationsMuted ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-600"}`}>
                  {notificationsMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-800">Notifications</p>
                  <p className="text-[11px] text-gray-400">Mute budget crossing warnings</p>
                </div>
              </div>
              <button
                id="btn-toggle-notifications"
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  !notificationsMuted ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    !notificationsMuted ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Account Information Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Account Information
              </h3>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3.5">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Student Name</p>
                    <p className="text-xs font-bold text-gray-800">{state.profile.name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Email Address</p>
                    <p className="text-xs font-bold text-gray-800">{state.profile.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Course / Branch</p>
                    <p className="text-xs font-bold text-gray-800">{state.profile.course || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">University</p>
                    <p className="text-xs font-bold text-gray-800">{state.profile.university || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest pl-1">
                Danger Zone
              </h3>
              <button
                id="btn-settings-logout"
                onClick={handleLogoutClick}
                className="w-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from Device
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Menu Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};
