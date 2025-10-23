import React, { useState } from 'react';
import { ArrowLeft, Camera, Eye, EyeOff } from 'lucide-react';
import { User } from '../types/User';
import { auth } from '../firebase-config'; // Import the auth object
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail
} from 'firebase/auth';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const normalizedEmail = formData.email.trim().toLowerCase();

  // ✅ Username validation
  if (isSignUp) {
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }
  }

  // ✅ Password match validation
  if (isSignUp && formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    setLoading(false);
    return;
  }

  try {
    if (isSignUp) {
      // ✅ Sign-up flow
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.username || normalizedEmail.split("@")[0],
      });

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        name:
          userCredential.user.displayName?.trim() ||
          formData.username.trim() ||
          userCredential.user.email!.split("@")[0],
      };

      onLogin(user);
    } else {
      // ✅ Try logging in directly
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          formData.password
        );

        const user: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name:
            userCredential.user.displayName ||
            userCredential.user.email!.split("@")[0],
        };

        onLogin(user);
      } catch (err: any) {
        console.error("Login error:", err);

        // ✅ Handle specific login failures
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found"
        ) {
          setError("Please check your email or password credential.");
        } else if (err.code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many failed attempts. Please try again later.");
        } else {
          setError(err.message || "Something went wrong. Please try again.");
        }
      }
    }
  } catch (err: any) {
    console.error("Global error:", err);
    
    // ✅ Handle sign-up specific errors
    if (err.code === "auth/email-already-in-use") {
      setError("This email is already registered. Please sign in instead.");
    } else if (err.code === "auth/weak-password") {
      setError("Password is too weak. Please use a stronger password.");
    } else {
      setError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2 ml-8">
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PrintPro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isSignUp ? 'Join PrintPro to start printing your photos' : 'Sign in to your PrintPro account'}
              </p>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={isSignUp}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={isSignUp}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email) {
                      setError("Please enter your email address first.");
                      return;
                    }
                    try {
                      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
                      setError("Password reset email sent. Please check your inbox.");
                    } catch {
                      setError("Unable to send reset email. Please try again later.");
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;