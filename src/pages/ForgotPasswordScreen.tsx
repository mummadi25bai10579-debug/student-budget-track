import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletIllustration } from '../components/Illustrations';
import { ArrowLeft, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate simple email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
      toast.success('Password reset email sent successfully. Please check your inbox.');
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/user-not-found') {
          setError('User not found');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email');
        } else if (err.code === 'auth/network-request-failed') {
          setError('Network error');
        } else {
          setError('Failed to send reset link. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:max-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#7c8eb1] overflow-hidden flex flex-col justify-between relative border border-gray-200">
        
        {/* Header toolbar */}
        <div className="px-6 pt-6 flex justify-between items-center text-gray-900">
          <button
            id="forgot-back-btn"
            onClick={() => navigate('/login')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-900 transition-colors cursor-pointer"
            aria-label="Back to Login"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Core Body Container */}
        <div className="px-8 pb-6 flex-1 flex flex-col items-center justify-center">
          
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mt-2 font-sans">
            Reset Password
          </h2>
          <p className="text-sm text-gray-800 text-center mt-1">
            Enter your email address to reset your password.
          </p>

          {/* Top Middle Illustration */}
          <div className="my-5 flex justify-center">
            <WalletIllustration className="w-28 h-28 hover:scale-105 transition-transform duration-300" imgClassName="object-contain rounded-3xl shadow-lg" />
          </div>

          <div className="w-full">
            {success ? (
              <div 
                id="forgot-success-banner"
                className="p-6 bg-[#d9e68d] border border-green-300 rounded-2xl flex flex-col items-center text-center gap-3 animate-fade-in"
              >
                <CheckCircle className="w-12 h-12 text-[#1a2d54]" />
                <p className="text-sm font-bold text-[#1a2d54] leading-relaxed">
                  Please check your email for password reset instructions.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 text-xs font-semibold text-[#1a2d54] uppercase tracking-wider hover:underline"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                
                {error && (
                  <div id="forgot-error-banner" className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Field Container */}
                <div className="space-y-1">
                  <input
                    id="forgot-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full py-4 px-5 bg-[#fcd34d] hover:bg-[#fbd03d] focus:bg-[#facc15] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                    required
                  />
                </div>

                {/* Submit CTA Button */}
                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4.5 bg-[#1A20E2AD] hover:bg-[#1A20E2]/80 active:bg-[#1A20E2]/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all tracking-wide text-base leading-none cursor-pointer mt-4 flex justify-center items-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>

          {!success && (
            <div className="mt-6 text-center text-sm">
              <button
                id="forgot-return-btn"
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-[#1a2d54] hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

        </div>

        {/* Cohesive Bright Blue Footer Row to match LoginScreen */}
        <div id="forgot-social-footer" className="bg-[#007aff] h-12 rounded-b-[24px] md:rounded-b-[40px] border-t border-[#007aff]" />
        
      </div>
    </div>
  );
};
