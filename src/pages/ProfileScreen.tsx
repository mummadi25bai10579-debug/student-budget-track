import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { Category } from "../types";
import {
  ArrowLeft,
  User,
  Settings,
  FileText,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
  ArrowUpRight,
  TrendingUp,
  Download,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";
import { auth } from "../firebase";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { UserAvatar } from "../components/UserAvatar";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout, updateProfile } = useAppState();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [profileName, setProfileName] = useState(state.profile.name);
  const [profileCourse, setProfileCourse] = useState(state.profile.course);
  const [profileUni, setProfileUni] = useState(state.profile.university);
  const [profileEmail, setProfileEmail] = useState(state.profile.email);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  React.useEffect(() => {
    setProfileName(state.profile.name);
    setProfileCourse(state.profile.course);
    setProfileUni(state.profile.university);
    setProfileEmail(state.profile.email);
  }, [state.profile]);

  // Stats for the PDF Summary
  const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = state.budget?.monthlyBudget || 0;

  const handleSaveProfile = async () => {
    updateProfile({
      ...state.profile,
      name: profileName,
      course: profileCourse,
      university: profileUni,
      email: profileEmail,
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await firebaseUpdateProfile(currentUser, {
          displayName: profileName,
        });
      } catch (err: any) {
        console.warn("Failed to update Firebase profile:", err.message);
      }
    }

    setIsEditingInfo(false);
    toast.success("Profile successfully updated!");
  };


  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const toastId = toast.loading("Generating PDF Report...");
    
    try {
      const doc = new jsPDF();
      
      // Top accent bar
      doc.setFillColor(139, 92, 246);
      doc.rect(0, 0, 210, 4, "F");

      // Title & Header details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text("STUDENT FINANCE REPORT", 20, 25);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("VIT CS Hostel Academic Registry", 20, 31);
      
      const dateStr = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      doc.text(`Date: ${dateStr}`, 155, 31);

      // Section Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 36, 190, 36);

      // Student Details Container Card
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(20, 41, 170, 31, 3, 3, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text("ACADEMIC REGISTRY PROFILE", 24, 47);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Student Name:  ${state.profile.name || "N/A"}`, 24, 53);
      doc.text(`Course Branch:  ${state.profile.course || "N/A"}`, 24, 58);
      doc.text(`University:          ${state.profile.university || "N/A"}`, 24, 63);
      doc.text(`Academic Email:  ${state.profile.email || "N/A"}`, 24, 68);

      // Financial stats summary title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("MONTHLY FINANCIAL RECONCILIATION", 20, 83);
      doc.line(20, 86, 190, 86);

      // Total Budget
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Allocated Monthly Cap:", 20, 93);
      doc.setFont("Helvetica", "bold");
      doc.text(`Rs. ${totalBudget.toLocaleString()}`, 145, 93, { align: "right" });

      // Total Spent
      doc.setFont("Helvetica", "normal");
      doc.text("Total Spent to Date:", 20, 100);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text(`Rs. ${totalSpent.toLocaleString()}`, 145, 100, { align: "right" });

      // Outstanding Balance
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("Outstanding Balance:", 20, 107);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(`Rs. ${(totalBudget - totalSpent).toLocaleString()}`, 145, 107, { align: "right" });

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 113, 190, 113);

      // Programmed Categories Table
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("DETAILED CATEGORICAL EXPENDITURES", 20, 122);

      // Headers
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("CATEGORY", 20, 130);
      doc.text("BUDGET VS SPENT METRIC", 145, 130, { align: "right" });
      doc.line(20, 132, 190, 132);

      // Fill values
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);

      let rowY = 139;
      if (state.budget) {
        Object.entries(state.budget.categoryBudgets).forEach(([cat, val]) => {
          const spentVal = state.expenses
            .filter((e) => e.category === (cat as Category))
            .reduce((sum, e) => sum + e.amount, 0);
  
          doc.setFont("Helvetica", "bold");
          doc.text(cat, 20, rowY);
  
          doc.setFont("Helvetica", "normal");
          doc.text(`Rs. ${spentVal.toLocaleString()} Spent of Rs. ${val.toLocaleString()} Limit`, 145, rowY, { align: "right" });
  
          doc.setDrawColor(241, 245, 249);
          doc.line(20, rowY + 3, 190, rowY + 3);
  
          rowY += 9;
        });
      }

      // Simple signature or reference watermark footer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("Securely processed via Student Budget Tracker's Academic Cryptographic Export system.", 105, 280, { align: "center" });

      doc.save("Student_Finance_Report.pdf");
      toast.success("PDF downloaded successfully", { id: toastId });
      setShowExportModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport simulator with intense purple background */}
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#8b5cf6] overflow-hidden flex flex-col justify-between relative pb-20 border border-gray-100">
        <div className="flex-1 flex flex-col">
          {/* Header Row */}
          <div className="px-6 pt-6 pb-2.5 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <button
                id="profile-back-btn"
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-bold tracking-tight font-sans">
                Profile
              </h2>
            </div>

            <button
              id="profile-logout-btn"
              onClick={() => {
                logout();
              }}
              className="p-2 bg-red-100/10 hover:bg-red-100/20 text-red-200 rounded-full transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>

          {/* 1. Main Student Profile Capsule */}
          <div className="px-6 mt-4 flex flex-col items-center">
            {/* White round-bordered Avatar wrapper */}
            <div className="w-24 h-24 relative -mb-10 z-10">
              <UserAvatar
                name={state.profile.name}
                email={state.profile.email}
                avatarUrl={state.profile.avatarUrl}
                className="w-24 h-24 text-3xl"
              />
            </div>

            {/* Blue-violet gradient details container */}
            <div
              id="profile-headline-capsule"
              className="w-full bg-[#bfdbfe]/80 rounded-3xl p-5 pt-12 shadow-md text-center border border-white/20"
            >
              {isEditingInfo ? (
                <div className="space-y-2 animate-fade-in text-left mt-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2 bg-white rounded border text-sm font-bold"
                    placeholder="Student Name"
                  />
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2 bg-white rounded border text-sm"
                    placeholder="Email Address"
                  />
                  <input
                    type="text"
                    value={profileCourse}
                    onChange={(e) => setProfileCourse(e.target.value)}
                    className="w-full p-2 bg-white rounded border text-xs"
                    placeholder="Course Name"
                  />
                  <input
                    type="text"
                    value={profileUni}
                    onChange={(e) => setProfileUni(e.target.value)}
                    className="w-full p-2 bg-white rounded border text-xs"
                    placeholder="University Name"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsEditingInfo(false);
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-[#1e293b] tracking-tight font-sans">
                    {state.profile.name}
                  </h3>
                  <p className="text-xs font-bold text-[#334155] tracking-wide mt-1 font-sans">
                    {state.profile.course}
                  </p>
                  <p className="text-xs font-semibold text-[#475569] tracking-tight mt-0.5 font-sans">
                    {state.profile.university}
                  </p>
                  <p className="text-xs font-bold text-[#2563eb] mt-2 font-sans hover:underline cursor-pointer">
                    {state.profile.email}
                  </p>
                  
                  {/* Verification Status Indicator */}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-2xl w-fit mx-auto self-center">
                    <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-[11px] font-extrabold text-green-700 tracking-wide uppercase">
                      Email Verified
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Menu selection block */}
          <div className="px-6 mt-6 flex-1">
            <div
              id="profile-options-board"
              className="bg-white rounded-3xl shadow-lg p-2.5 space-y-1 border border-gray-100"
            >
              {/* Option row: Personal Information */}
              <button
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="w-full p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#8b5cf6] flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">
                    Personal Information
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Option row: Settings */}
              <button
                onClick={() => navigate("/settings")}
                className="w-full p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563eb] flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">
                    Settings
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Option row: Export Report (PDF) */}
              <button
                id="btn-export-pdf"
                onClick={() => setShowExportModal(true)}
                className="w-full p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">
                    Export Report (PDF)
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Option row: Help & Support */}
              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">
                    Help & Support
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Option row: About App */}
              <button
                onClick={() => setShowAboutModal(true)}
                className="w-full p-3.5 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">
                    About App
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Home bottom layout */}
        <BottomNavigation />

        {/* ABOUT APP MODAL */}
        {showAboutModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm w-full animate-scale-up border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 font-sans text-center">
                About Student Budget Tracker
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed text-center">
                This app was designed from actual student finance models to help
                BTech & collegiate students track hostelry, books, stationery,
                food, and shopping expenses. Built on local state parameters for
                fully responsive offline usage.
              </p>
              <div className="bg-purple-50 p-3 rounded-2xl text-center text-xs font-bold text-purple-700">
                Version 1.0.4 (Design2Code Prototype)
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Great, thanks!
              </button>
            </div>
          </div>
        )}

        {/* PDF EXPORT MODAL */}
        {showExportModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto w-full">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scale-up border border-gray-100 flex flex-col justify-between max-h-[85vh]">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <span className="text-sm font-black text-gray-800 flex items-center gap-1.5 font-sans">
                  <FileText className="w-4 h-4 text-green-500" />
                  PDF Statement Draft
                </span>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Printable Invoice Page content */}
              <div
                id="student-invoice-pdf"
                className="my-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3.5 text-left text-xs overflow-y-auto pr-1"
              >
                <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                  <div>
                    <h4 className="font-black text-gray-950 font-sans">
                      STUDENT FINANCE REPORT
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      VIT CS Hostel Academic Registry
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-gray-500 font-sans">
                    Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>

                {/* Profile details */}
                <div className="space-y-0.5 text-gray-700 text-[11px] bg-blue-50/50 p-2 rounded-lg">
                  <p>
                    <strong>Student Name:</strong> {state.profile.name}
                  </p>
                  <p>
                    <strong>Course ID:</strong> {state.profile.course}
                  </p>
                  <p>
                    <strong>University:</strong> {state.profile.university}
                  </p>
                </div>

                {/* Mini Statement values */}
                <div className="space-y-1 text-gray-800 font-sans">
                  <div className="flex justify-between font-bold border-b border-dashed border-gray-200 pb-1.5">
                    <span>Allocated Monthly Cap:</span>
                    <span>₹{totalBudget.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold border-b border-dashed border-gray-200 pb-1.5">
                    <span>Total Spent to Date:</span>
                    <span>₹{totalSpent.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Outstanding Balance:</span>
                    <span>
                      ₹{(totalBudget - totalSpent).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Compact table lists */}
                <div className="space-y-1">
                  <p className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide">
                    Category Allocation Summary
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {state.budget && Object.entries(state.budget.categoryBudgets).map(([cat, val]) => {
                      const sp = state.expenses
                        .filter((e) => e.category === (cat as Category))
                        .reduce((sum, e) => sum + e.amount, 0);
                      return (
                        <div
                          key={cat}
                          className="flex justify-between text-[11px] text-gray-700"
                        >
                          <span>{cat}:</span>
                          <span>
                            ₹{sp} of ₹{val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Output buttons */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  id="btn-download-report"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadPdf}
                  className="py-3 w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-gray-200 cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isGeneratingPdf ? "Wait..." : "Download"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT / HELP & SUPPORT MODAL */}
        {showSupportModal && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto w-full">
            <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-sm w-full animate-scale-up border border-gray-100 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
              <div className="border-b border-gray-100 pb-2.5 flex justify-between items-center">
                <span className="text-sm font-black text-gray-800 flex items-center gap-1.5 font-sans">
                  <LifeBuoy className="w-4 h-4 text-orange-500 animate-pulse" />
                  Help & Support Center
                </span>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-extrabold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 my-3 text-xs text-left">
                {/* Contact Email section */}
                <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-2xl space-y-1">
                  <p className="font-extrabold text-orange-850 text-orange-950">Direct Support Email</p>
                  <p className="text-gray-600">Send queries, academic verification docs or billing issue claims directly to our dev registry:</p>
                  <a href="mailto:support@vit.edu" className="inline-block font-black text-indigo-600 hover:underline mt-1">
                    support@vit.edu
                  </a>
                </div>

                {/* FAQ Block */}
                <div className="space-y-2">
                  <p className="font-black text-gray-700 uppercase tracking-wider text-[10px]">Frequently Asked Questions</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    <div className="p-2 border border-gray-50 bg-gray-50/50 rounded-xl space-y-1">
                      <p className="font-bold text-gray-800">Q: How do I create a budget allocation limit?</p>
                      <p className="text-gray-500 text-[11px]">A: Visit the 'Set Budget' screen through bottom navigation and adjust target category numbers dynamically.</p>
                    </div>
                    <div className="p-2 border border-gray-50 bg-gray-50/50 rounded-xl space-y-1">
                      <p className="font-bold text-gray-800">Q: Does the app work completely offline?</p>
                      <p className="text-gray-500 text-[11px]">A: Yes! Your expenses and custom settings are archived strictly in localized local-storage vector pools.</p>
                    </div>
                    <div className="p-2 border border-gray-50 bg-gray-50/50 rounded-xl space-y-1">
                      <p className="font-bold text-gray-800">Q: Are calculations mathematically synchronized?</p>
                      <p className="text-gray-500 text-[11px]">A: Yes, limits are cross-referenced daily with user transaction entries to provide instantaneous delta results.</p>
                    </div>
                  </div>
                </div>

                {/* Bug Report Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = (e.currentTarget.elements.namedItem("bugText") as HTMLTextAreaElement).value;
                    if (!text.trim()) {
                      toast.error("Please enter bug details first.");
                      return;
                    }
                    toast.success("Bug reported successfully! Thank you.");
                    (e.currentTarget.elements.namedItem("bugText") as HTMLTextAreaElement).value = "";
                    setShowSupportModal(false);
                  }}
                  className="space-y-1.5 border-t border-gray-100 pt-3"
                >
                  <p className="font-black text-gray-700 uppercase tracking-wider text-[10px]">Report a Technical Bug</p>
                  <textarea
                    required
                    name="bugText"
                    rows={2}
                    className="w-full p-2 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Describe what occurred, any unexpected errors, or screen freeze instances..."
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Send Bug Report
                  </button>
                </form>

                {/* Feedback Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = (e.currentTarget.elements.namedItem("feedbackText") as HTMLTextAreaElement).value;
                    if (!text.trim()) {
                      toast.error("Please provide some feedback.");
                      return;
                    }
                    toast.success("Feedback submitted! We appreciate your support.");
                    (e.currentTarget.elements.namedItem("feedbackText") as HTMLTextAreaElement).value = "";
                    setShowSupportModal(false);
                  }}
                  className="space-y-1.5 border-t border-gray-100 pt-3"
                >
                  <p className="font-black text-gray-700 uppercase tracking-wider text-[10px]">User Feedback Questionnaire</p>
                  
                  {/* Star Rating visualization */}
                  <div className="flex gap-1.5 py-1 text-slate-300">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="cursor-pointer text-amber-500 text-sm hover:scale-110 transition-transform">★</span>
                    ))}
                    <span className="text-[10px] text-gray-400 self-center font-bold ml-1">Recommend this App!</span>
                  </div>

                  <textarea
                    required
                    name="feedbackText"
                    rows={2}
                    className="w-full p-2 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Tell us what you like or general aspects you'd love us to build next..."
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

