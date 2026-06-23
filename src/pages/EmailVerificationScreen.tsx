import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

export const EmailVerificationScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleResend = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success("Verification email resent!");
      } catch (error: any) {
        if (error?.code === 'auth/too-many-requests') {
          toast.error("Too many requests. Please wait a few minutes before trying again.");
        } else {
          toast.error(error.message || "Failed to resend verification email.");
        }
      }
    } else {
      toast.error("Please login first to resend verification email.");
      navigate('/login');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:max-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#7c8eb1] overflow-hidden flex flex-col relative border border-gray-200">
        
        {/* Header */}
        <div className="px-6 pt-6 flex justify-between items-center text-gray-900 border-b border-white/20 pb-4">
          <button
            onClick={() => navigate('/login')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="font-semibold text-lg text-white">Email Verification</span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/95 rounded-b-[40px] md:rounded-b-[40px]">
          <div className="w-24 h-24 bg-blue-100 text-[#7c8eb1] rounded-full flex items-center justify-center mb-8 mx-auto shadow-sm">
            <Mail className="w-12 h-12" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            We've sent a verification email to your address. Please check your inbox and verify your email before logging in. If you don't receive it, check your Spam folder.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#7c8eb1] text-white py-4 rounded-[16px] font-medium shadow-md hover:bg-[#6a7a9e] transition-all transform hover:-translate-y-0.5 mb-4 text-lg"
          >
            Back to Login
          </button>

          <button
            onClick={handleResend}
            className="w-full bg-white border-2 border-[#7c8eb1] text-[#7c8eb1] py-4 rounded-[16px] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Send className="w-5 h-5" />
            Resend Verification Email
          </button>
        </div>

      </div>
    </div>
  );
};
