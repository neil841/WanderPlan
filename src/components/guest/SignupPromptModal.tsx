'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Users, Save, FileDown, Clock, CheckCircle2, Share2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getSignupPromptMessage, type SignupPromptReason } from '@/lib/guest-mode';

interface SignupPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: SignupPromptReason;
  onSignup?: () => void;
  onDismiss?: () => void;
}

/**
 * SignupPromptModal Component
 *
 * Premium smart modal that prompts users to sign up at strategic moments.
 * Features glassmorphism, smooth animations, and high-end visual design.
 */
export function SignupPromptModal({
  open,
  onOpenChange,
  reason,
  onSignup,
  onDismiss,
}: SignupPromptModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const message = getSignupPromptMessage(reason);

  const iconMap: Record<SignupPromptReason, React.ReactNode> = {
    collaborate: <Users className="h-8 w-8 text-white" />,
    share: <Share2 className="h-8 w-8 text-white" />,
    save: <Save className="h-8 w-8 text-white" />,
    export: <FileDown className="h-8 w-8 text-white" />,
    engagement: <Clock className="h-8 w-8 text-white" />,
    feature_limit: <Sparkles className="h-8 w-8 text-white" />,
  };

  const gradientMap: Record<SignupPromptReason, string> = {
    collaborate: 'from-blue-600 via-indigo-500 to-cyan-500',
    share: 'from-sky-500 via-blue-500 to-indigo-500',
    save: 'from-emerald-500 via-green-500 to-teal-500',
    export: 'from-violet-600 via-purple-500 to-fuchsia-500',
    engagement: 'from-orange-500 via-amber-500 to-yellow-500',
    feature_limit: 'from-blue-600 via-cyan-500 to-teal-500',
  };

  const handleSignup = () => {
    setIsLoading(true);
    if (onSignup) {
      onSignup();
    } else {
      router.push(`/register?reason=${reason}`);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    onOpenChange(false);
  };

  const handleLogin = () => {
    router.push(`/login?reason=${reason}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
          >
            {/* Premium Header with Animated Gradient */}
            <div className={`relative p-8 text-center overflow-hidden`}>
              {/* Animated Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[reason]} opacity-100`} />

              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </motion.button>

              {/* Icon Container with Glow */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 mb-6 shadow-xl z-10"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl" />
                {iconMap[reason]}
              </motion.div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-2">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                    {message.title}
                  </DialogTitle>
                  <DialogDescription className="text-blue-50 text-lg font-medium leading-relaxed">
                    {message.description}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Benefit Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-lg"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                <span className="text-sm font-semibold text-white tracking-wide uppercase text-[10px]">
                  {message.benefit}
                </span>
              </motion.div>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-8 bg-white dark:bg-slate-900">
              {/* Benefits List with Staggered Animation */}
              <div className="space-y-4">
                {[
                  { title: 'Real-time collaboration', desc: 'Plan together with friends and family' },
                  { title: 'Cloud sync', desc: 'Access from any device, anywhere' },
                  { title: 'Premium features', desc: 'Export PDFs, share links, and more' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl font-semibold text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Free Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  Log in
                </Button>

                <button
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                >
                  Maybe later
                </button>
              </div>

              {/* Trust Footer */}
              <div className="pt-2 text-center">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  No credit card required • Secure & Private
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
