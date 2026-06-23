import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { WalletIllustration } from "../components/Illustrations";
import { Eye, EyeOff, ShieldAlert, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile as firebaseUpdateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { UserAvatar } from "../components/UserAvatar";

export const SignUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProfile: appUpdateProfile, forceLogin } = useAppState();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const googleInfo = location.state as {
    isGoogleUser?: boolean;
    uid?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    prefilledEmail?: string;
  } | null;

  useEffect(() => {
    if (googleInfo?.isGoogleUser) {
      setFullName(googleInfo.displayName || "");
      setEmail(googleInfo.email || "");
    } else if (googleInfo?.prefilledEmail) {
      setEmail(googleInfo.prefilledEmail);
    }
  }, [googleInfo]);

  useEffect(() => {
    if (state.isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (googleInfo?.isGoogleUser) {
      if (!fullName || !email) {
        setError("Please fill in all required fields");
        return;
      }

      try {
        setLoading(true);
        const uid = googleInfo.uid || auth.currentUser?.uid;
        if (!uid) {
          setError("No authenticated Google session found.");
          return;
        }

        const toastId = toast.loading("Creating your profile...");

        // Save user to Firestore
        await setDoc(doc(db, "users", uid), {
          uid,
          displayName: fullName,
          name: fullName,
          email: email,
          photoURL: googleInfo?.photoURL || "",
          createdAt: new Date().toISOString(),
        }, { merge: true });

        // Create user profile in global state
        appUpdateProfile({
          ...state.profile,
          name: fullName,
          email: email,
          avatarUrl: googleInfo?.photoURL || "",
        });

        toast.dismiss(toastId);
        if (forceLogin) forceLogin();
        navigate("/dashboard");
      } catch (err: any) {
        console.warn("Firestore/Google profile registration error:", err);
        setError("Failed to complete account details. Please try again.");
        toast.dismiss();
        toast.error("Failed to complete account details. Please update your Firebase Rules.");
      } finally {
        toast.dismiss();
        setLoading(false);
      }
    } else {
      const trimmedEmail = email.trim();
      const trimmedFullName = fullName.trim();
      console.log("[SignUp] Starting Email Sign Up Process for:", trimmedEmail);

      if (!trimmedFullName || !trimmedEmail || !password || !confirmPassword) {
        setError("Please fill in all required fields (Full Name, Email, Password, Confirm Password).");
        console.warn("[SignUp] Validation Failed: Missing required fields");
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError("Please enter a valid email address.");
        console.warn("[SignUp] Validation Failed: Invalid email format:", trimmedEmail);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        console.warn("[SignUp] Validation Failed: Password mismatch");
        return;
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        console.warn("[SignUp] Validation Failed: Password too short");
        return;
      }

      setError("");
      
      try {
        setLoading(true);
        const toastId = toast.loading("Creating your account...");
        let user;

        try {
          console.log("Before createUserWithEmailAndPassword");
          const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          user = userCredential.user;
          console.log("After createUserWithEmailAndPassword");
        } catch (error: any) {
          console.warn("Signup Error (createUser):", error);
          toast.dismiss(toastId);
          throw error;
        }

        try {
          console.log("Before updateProfile");
          await firebaseUpdateProfile(user, {
            displayName: trimmedFullName,
            photoURL: "",
          });
          console.log("After updateProfile");
        } catch (error: any) {
          console.warn("Signup Error (Profile Update):", error);
          toast.error(error.message || "Failed to update profile name.");
        }

        console.log("SIGNUP SUCCESS");
        try {
          const trimmedFullName = fullName.trim();
          console.log("SIGNUP USERNAME:", trimmedFullName);
          
          const signupPayload = {
            uid: user.uid,
            displayName: trimmedFullName,
            name: trimmedFullName,
            username: trimmedFullName,
            email: trimmedEmail,
            photoURL: "",
            provider: "email",
            createdAt: serverTimestamp(),
          };
          
          console.log("FIRESTORE WRITE PAYLOAD:", signupPayload);
          
          await setDoc(doc(db, "users", user.uid), signupPayload, { merge: true });
          console.log("FIRESTORE WRITE SUCCESS: Document users/" + user.uid + " written.");
          console.log("FIRESTORE PROFILE CREATED");
        } catch (error: any) {
          console.warn("Signup Warning (Firestore setDoc):", error);
          toast.dismiss(toastId);
          toast.error(error.message || "Failed to save user profile.");
          setLoading(false);
          return; // Stop loading and stop signup flow on setDoc failure
        }

        try {
          console.log("Step 4: Sending verification email...");
          console.log("Before sendEmailVerification");
          await sendEmailVerification(user);
          console.log("After sendEmailVerification");
          console.log("Step 4 Complete");
        } catch (error: any) {
          console.warn("Signup Error (Email Verification):", error);
          toast.error(error.message || "Failed to send verification email.");
        }

        try {
          console.log("Step 5: Redirecting...");
          toast.dismiss(toastId);
          console.log("Step 5 Complete");
          
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-100`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-green-600 mb-1">
                      Account Created Successfully!
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      A verification email has been sent to your email address. Please check your inbox and verify your email before logging in. If you don't receive it, check your Spam folder or use Resend Verification Email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 6000 });
          
          console.log("Before navigate('/email-verification')");
          navigate("/email-verification");
          console.log("After navigate('/email-verification')");
        } catch (error: any) {
          console.warn("Signup Warning (SignOut/Redirect):", error);
          toast.dismiss(toastId);
          toast.error("Failed to redirect after sign up");
        }

      } catch (err: any) {
        console.warn("Signup Flow Catch:", err);
        toast.dismiss();
        if (err instanceof FirebaseError) {
          if (err.code === 'auth/email-already-in-use') {
            setError('Account already exists. Please login.');
            toast.error('Account already exists. Please login.');
            setTimeout(() => {
              navigate("/login");
            }, 1500);
          } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
            toast.error('Password is too weak (min 6 characters)');
          } else if (err.code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
            toast.error('Invalid email address format');
          } else {
            setError(err.message || 'Failed to create account. Please try again.');
            toast.error(err.message || 'Failed to create account.');
          }
        } else {
          setError('An unexpected error occurred.');
          toast.error('An unexpected error occurred.');
        }
      } finally {
        toast.dismiss();
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:max-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#7c8eb1] overflow-hidden flex flex-col justify-between relative border border-gray-200">
        {/* Header toolbar */}
        <div className="px-6 pt-6 flex justify-between items-center text-gray-900">
          <button
            id="signup-back-btn"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Core Body Container */}
        <div className="px-8 pb-6 flex-1 flex flex-col items-center justify-center overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mt-2 font-sans">
            Create Account
          </h2>
          <p className="text-sm text-gray-800 text-center mt-1">
            Sign up to get started
          </p>

          {googleInfo?.isGoogleUser && googleInfo.photoURL ? (
            <div className="mt-4 mb-2 animate-fade-in">
              <UserAvatar
                name={fullName}
                avatarUrl={googleInfo.photoURL}
                className="w-20 h-20 text-2xl"
              />
            </div>
          ) : (
            <div className="mt-4 mb-2 animate-fade-in">
              {fullName.trim() && (
                <UserAvatar
                  name={fullName}
                  avatarUrl=""
                  className="w-20 h-20 text-2xl mx-auto"
                />
              )}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full py-3.5 px-5 bg-white/70 hover:bg-white/90 focus:bg-white text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full py-3.5 px-5 bg-[#fcd34d] hover:bg-[#fbd03d] focus:bg-[#facc15] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                required
              />
            </div>

            {/* Password Field */}
            {!googleInfo?.isGoogleUser && (
              <>
                <div className="space-y-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full py-3.5 px-5 bg-[#d9e68d] hover:bg-[#d0de7f] focus:bg-[#c7d66d] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-650 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full py-3.5 px-5 bg-[#d9e68d] hover:bg-[#d0de7f] focus:bg-[#c7d66d] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-655 hover:text-gray-900 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Sign Up CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-[#1A20E2AD] hover:bg-[#1A20E2]/80 active:bg-[#1A20E2]/90 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all tracking-wide text-base leading-none mt-4 flex justify-center items-center gap-2"
            >
              {loading ? "Creating..." : (googleInfo?.isGoogleUser ? "Continue/Create Account" : "Sign Up")}
            </button>
          </form>

          {/* Direct Login Helper */}
          <div className="mt-6 text-center text-sm pb-4">
            <span className="text-gray-800">Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold text-[#1a2d54] hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
