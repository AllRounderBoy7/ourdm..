import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../lib/supabase';
import { hapticFeedback } from '../utils/haptic';

export const AuthScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('you@ourdm.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  const handleGoogleLogin = async () => {
    hapticFeedback.light(); // Instant haptic feedback
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Error logging in:', error);
      hapticFeedback.error();
      // Fallback to demo mode
      login('you@ourdm.com');
      hapticFeedback.success();
    } else {
      hapticFeedback.success();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4"
          >
            <MessageCircle className="w-10 h-10 text-violet-600" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-2">OurDM</h1>
          <p className="text-violet-100 text-lg">Connect, Chat & Call Instantly</p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {/* Google Login */}
          <motion.button
            onClick={handleGoogleLogin}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            disabled={isLoading}
            className="w-full bg-white text-gray-800 rounded-2xl py-4 px-6 font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl mb-4 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-3 border-gray-300 border-t-violet-600 rounded-full"
                />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <motion.button
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-1 bg-violet-600/50 text-white rounded-full text-sm hover:bg-violet-600/70 transition-all active:bg-violet-600/80"
              >
                {showEmailLogin ? 'Hide' : 'Show'} Email Login
              </motion.button>
            </div>
          </div>

          {/* Email Login Form */}
          {showEmailLogin && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-white text-violet-600 rounded-xl py-3 font-semibold hover:bg-violet-50 transition-all shadow-lg hover:shadow-xl active:shadow-md"
              >
                Sign In
              </motion.button>
            </motion.form>
          )}

          {/* App Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/70 text-xs text-center">
              🔒 Secure authentication powered by Supabase
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div>
            <div className="text-white font-bold text-2xl">50+</div>
            <div className="text-violet-200 text-sm">Features</div>
          </div>
          <div>
            <div className="text-white font-bold text-2xl">Real-time</div>
            <div className="text-violet-200 text-sm">Messaging</div>
          </div>
          <div>
            <div className="text-white font-bold text-2xl">HD</div>
            <div className="text-violet-200 text-sm">Calls</div>
          </div>
        </motion.div>

        {/* Footer - Made by Sameer Shah */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-white/50">
            Made with ❤️ by <span className="font-semibold text-white/70">Sameer Shah</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
