import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppContext";
import { WalletIllustration } from "../components/Illustrations";
import {
  Eye,
  EyeOff,
  Mail,
  Chrome,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { auth, db, googleProvider, facebookProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  sendEmailVerification,
  updateCurrentUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, forceLogin } = useAppState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);

  useEffect(() => {
    if (state.isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.isLoggedIn, navigate]);

  const handleGoogleLogin = async () => {
    const toastId = toast.loading("Signing in with Google...");
    try {
      setLoading(true);
      setError("");
      console.log("[GoogleLogin] Opening Firebase Google connection popup...");
      const { user } = await signInWithPopup(auth, googleProvider);
      
      console.log("[GoogleLogin] Google Authenticated user UID:", user.uid);
          const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore");
          
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
 
          console.log("[GoogleLogin] Storing user info directly in Firestore users collection...");
          console.log("FETCHING PROFILE");
          console.log("FIRESTORE READ UID:", user.uid);
          if (userSnap.exists()) {
            const docData = userSnap.data();
            console.log("FIRESTORE DOCUMENT:", docData);
            const foundName = docData.name || docData.username || docData.displayName;
            console.log("LOADED USERNAME:", foundName);
            console.log("PROFILE FOUND");
            console.log("USERNAME FOUND: " + foundName);
            await setDoc(userRef, {
              photoURL: user.photoURL || "",
            }, { merge: true });
          } else {
            console.log("REASON DOCUMENT MISSING: New Google user, document doesn't exist yet.");
            const signupPayload = {
              uid: user.uid,
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              name: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              username: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
              email: user.email || "",
              photoURL: user.photoURL || "",
              provider: "google",
              createdAt: serverTimestamp()
            };
            console.log("FIRESTORE WRITE PAYLOAD:", signupPayload);
            await setDoc(userRef, signupPayload, { merge: true });
            console.log("FIRESTORE WRITE SUCCESS: Google user document created.");
            console.log("PROFILE FOUND (CREATED)");
            console.log("USERNAME FOUND: " + signupPayload.name);
          }
      
      console.log("[GoogleLogin] Firestore profile saved successfully.");
      console.log("LOGIN SUCCESS");
      console.log("NAVIGATING TO DASHBOARD");
      toast.dismiss(toastId);
      console.log("GOOGLE LOGIN SUCCESS - NAVIGATING");
      if (forceLogin) forceLogin();
      navigate("/dashboard");
    } catch (err: any) {
      console.warn("[GoogleLogin] Google authentication cancelled or failed:", err.message);
      toast.dismiss(toastId);
      if (err instanceof FirebaseError) {
        if (err.code === "auth/popup-blocked") {
          toast.loading("Popup blocked. Redirecting...");
          signInWithRedirect(auth, googleProvider);
        } else if (err.code === "auth/unauthorized-domain") {
          const msg = `Domain not authorized. Add ${window.location.hostname} to Firebase Console > Auth > Settings > Authorized domains.`;
          toast.error(msg, { duration: 10000 });
          setError(msg);
        } else if (err.code === "auth/popup-closed-by-user") {
          toast.error("Sign-in cancelled.");
          setError("Sign-in cancelled.");
        } else {
          toast.error(err.message);
          setError(err.message);
        }
      } else {
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    toast.error("Current version not supported, may be used in next version", { duration: 4000 });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    console.log("[Login] Submitted login request for email:", trimmedEmail);

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password");
      console.warn("[Login] Failed: Empty email or password");
      return;
    }

    setError("");
    setLoading(true);
    const toastId = toast.loading("Signing in...");

    console.log("LOGIN START");

    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("LOGIN_TIMEOUT"));
      }, 15000); // Set to 15s for high-latency sandboxes
    });

    try {
      const loginTask = async () => {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        console.log("LOGIN SUCCESS");
        console.log("AUTH SUCCESS");
        
        await userCredential.user.reload();
        await userCredential.user.getIdToken(true); // Force-refresh token to fetch the latest custom claims/verification info
        
        const user = auth.currentUser;
        
        if (!user || !user.emailVerified) {
          // If auth succeeded but email is actually not verified yet, report unverified
          return { status: "unverified", user: userCredential.user };
        }

        console.log("EMAIL VERIFIED");
        
        console.log("FETCHING PROFILE");
        try {
          const { getDoc, doc, setDoc, serverTimestamp } = await import("firebase/firestore");
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          console.log("FIRESTORE READ UID:", user.uid);
          if (userSnap.exists()) {
            const docData = userSnap.data();
            console.log("FIRESTORE DOCUMENT:", docData);
            const foundName = docData.name || docData.username || docData.displayName;
            console.log("LOADED USERNAME:", foundName);
            console.log("PROFILE FOUND");
            console.log("USERNAME FOUND: " + foundName);
          } else {
            console.log("REASON DOCUMENT MISSING: Document not found in users collection during email login.");
            const recoveryPayload = {
                uid: user.uid,
                displayName: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
                name: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
                username: user.displayName || (user.email ? user.email.split('@')[0] : "USERNAME_NOT_FOUND"),
                email: user.email || "",
                photoURL: user.photoURL || "",
                provider: "email",
                createdAt: serverTimestamp()
             };
             console.log("FIRESTORE RECOVERY WRITE PAYLOAD:", recoveryPayload);
             await setDoc(userRef, recoveryPayload);
             console.log("FIRESTORE WRITE SUCCESS: Recovery document written.");
             console.log("PROFILE FOUND (CREATED)");
             console.log("USERNAME FOUND: " + recoveryPayload.name);
          }
        } catch (dbErr) {
          console.error("Firestore profile fetch/fix failed:", dbErr);
        }

        console.log("PROFILE_LOADED");
        console.log("PROFILE FETCHED");
        console.log("NAVIGATING TO DASHBOARD");
        
        // This triggers AppContext of the authentication changes
        
        return { status: "verified" };
      };

      const result: any = await Promise.race([loginTask(), timeoutPromise]);
      clearTimeout(timeoutId);

      if (result.status === "unverified") {
        console.warn("[Login] Email not verified for user:", result.user?.email);
        toast.dismiss(toastId);
        setError("Please verify your email before logging in.");
        toast.error("Verification required. Please check your inbox.");
        setUnverifiedUser(result.user);
        return;
      }
      
      toast.dismiss(toastId);
      console.log("NAVIGATION START");
      if (forceLogin) forceLogin();
      navigate("/dashboard");
      console.log("LOGIN COMPLETE");

      // ONLY clear the inputs on successful navigation
      setEmail("");
      setPassword("");
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(error);
      toast.dismiss(toastId);
      
      if (error.message === "LOGIN_TIMEOUT") {
        toast.error("Login timeout. Please try again.");
        setError("Login timeout. Please try again.");
      } else if (error instanceof FirebaseError) {
        console.log("[Login] Firebase error code:", error.code);
        if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
          setError("Invalid email or password. Please verify your credentials or sign up.");
          toast.error("Invalid credentials");
        } else if (error.code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
          toast.error("Invalid email address");
        } else if (error.code === "auth/user-disabled") {
          setError("This account has been disabled. Please contact support.");
          toast.error("Account disabled");
        } else if (error.code === "auth/too-many-requests") {
          setError("Too many login attempts. Please try again later.");
          toast.error("Too many failed requests");
        } else {
          setError(error.message || "Invalid email or password.");
          toast.error(error.message || "Authentication failed");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred");
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md min-h-screen md:min-h-[812px] md:max-h-[812px] md:rounded-[40px] md:shadow-2xl bg-[#7c8eb1] overflow-hidden flex flex-col justify-between relative border border-gray-200">
        {/* Header toolbar */}
        <div className="px-6 pt-6 flex justify-between items-center text-gray-900">
          <button
            id="login-back-btn"
            onClick={() => navigate("/", { state: { fromBack: true } })}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Core Body Container */}
        <div className="px-8 pb-6 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mt-2 font-sans">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-800 text-center mt-1">
            Good to see you again
          </p>

          {/* Top Middle Illustration */}
          <div className="my-5 flex justify-center">
            <WalletIllustration
              className="w-28 h-28 hover:scale-105 transition-transform duration-300"
              imgClassName="object-contain rounded-3xl shadow-lg"
            />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{error}</span>
                 </div>
                 {error === "Please verify your email before logging in." && (
                    <button
                      type="button"
                      onClick={async () => {
                        const targetUser = unverifiedUser || auth.currentUser;
                        if (targetUser) {
                          try {
                            await sendEmailVerification(targetUser);
                            toast.success("Verification email sent.", { id: "emailResend" });
                          } catch (e: any) {
                            console.warn("[Login] Resend error:", e.message);
                            if (e?.code === 'auth/too-many-requests') {
                              toast.error("Too many requests. Please try again later.", { id: "emailResend" });
                            } else {
                              toast.error("Failed to resend verification email: " + (e?.message || "Unknown error"), { id: "emailResend" });
                            }
                          }
                        } else {
                          toast.error("Could not find user details. Please type your password again to request.");
                        }
                      }}
                      className="mt-1 font-bold text-blue-900 hover:underline text-left text-xs"
                    >
                      Resend Verification Email
                    </button>
                 )}
              </div>
            )}

            {/* Email Field Container */}
            <div className="space-y-1">
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full py-4 px-5 bg-[#fcd34d] hover:bg-[#fbd03d] focus:bg-[#facc15] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                required
              />
            </div>

            {/* Password Field Container */}
            <div className="space-y-1 relative">
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-4 px-5 bg-[#d9e68d] hover:bg-[#d0de7f] focus:bg-[#c7d66d] text-gray-900 placeholder-gray-600 font-medium rounded-xl border-none outline-none focus:ring-3 focus:ring-blue-400 transition-all font-sans"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-650 hover:text-gray-900 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me and Forgot Password bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  id="login-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400 border-gray-300 accent-blue-700"
                />
                <span className="text-gray-800">Remember me</span>
              </label>

              <button
                id="login-forgot-btn"
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="hover:underline text-[#1e3a8a]"
              >
                Forgot password
              </button>
            </div>

            {/* Login CTA Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-[#1A20E2AD] hover:bg-[#1A20E2]/80 active:bg-[#1A20E2]/90 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all tracking-wide text-base leading-none mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          {/* Direct Sign-up Helper */}
          <div className="mt-8 text-center text-sm">
            <span className="text-gray-800">Don't have an account! </span>
            <button
              id="login-signup-toggle"
              type="button"
              onClick={() => navigate("/signup")}
              className="font-bold text-[#1a2d54] hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>

          <div className="mt-2 text-xs font-semibold text-gray-800 tracking-wide">
            or continue with
          </div>
        </div>

        {/* Social Icons Dock in Bright Blue Footer Row */}
        <div
          id="login-social-footer"
          className="bg-[#007aff] py-6 px-6 flex flex-row items-center justify-between rounded-b-[24px] md:rounded-b-[40px] border-t border-[#007aff]"
        >
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-[52px] h-[46px] bg-white rounded-[16px] flex items-center justify-center shadow-sm transform transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
            title="Login with Google"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84A10.975 10.975 0 0 0 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16A10.985 10.985 0 0 0 1 12c0 1.79.43 3.47 1.16 4.93l3.68-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>

          <div className="h-5 w-[1px] bg-white/50" />

          {/* Facebook */}
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-[52px] h-[46px] bg-white rounded-[16px] flex items-center justify-center shadow-sm transform transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
            title="Login with Facebook"
          >
            <svg
              className="w-[22px] h-[22px]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
          </button>

          <div className="h-5 w-[1px] bg-white/50" />

          {/* Email Envelope */}
          <button
            onClick={() => {
              setError("");
              toast.success("Please enter your Email Address and Password below.", { id: "focusEmail" });
              const emailInput = document.getElementById("login-email-input");
              if (emailInput) {
                emailInput.focus();
                emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="w-[52px] h-[46px] bg-white rounded-[16px] flex items-center justify-center shadow-sm transform transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Login with Email"
          >
            <svg
              className="w-[24px] h-[24px]"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
