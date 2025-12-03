'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight, type LucideIcon } from 'lucide-react';

import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignupPromptModal } from '@/components/guest/SignupPromptModal';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface GatedFeatureTabProps {
  tabValue: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: Feature[];
  gradientFrom?: string;
  gradientTo?: string;
  tripId: string;
  children?: React.ReactNode; // For authenticated content
}

/**
 * GatedFeatureTab Component
 *
 * Smart component that shows:
 * - Guest users: Premium locked feature preview with signup CTA
 * - Authenticated users: Actual functional interface (passed as children)
 *
 * @component
 * @example
 * <GatedFeatureTab
 *   tabValue="messages"
 *   icon={MessageSquare}
 *   title="Real-Time Messages"
 *   description="Chat with your travel companions"
 *   features={[...]}
 *   tripId={tripId}
 * >
 *   <MessagesInterface tripId={tripId} />
 * </GatedFeatureTab>
 */
export function GatedFeatureTab({
  tabValue,
  icon: Icon,
  title,
  description,
  features,
  gradientFrom = 'blue-500',
  gradientTo = 'cyan-500',
  tripId,
  children,
}: GatedFeatureTabProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const isGuestTrip = tripId.startsWith('guest-');

  const handleUnlock = () => {
    setShowSignupModal(true);
  };

  // If children are provided (authenticated users), show them
  if (children) {
    return <>{children}</>;
  }

  return (
    <>
      <TabsContent value={tabValue} className="space-y-6">
        {/* Header with Lock Badge */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Icon className="h-7 w-7 text-gray-400" />
              {title}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <Lock className="h-3.5 w-3.5" />
                Locked
              </span>
            </h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        {/* Premium Locked Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
            {/* Gradient Header */}
            <div
              className={`relative bg-gradient-to-br from-${gradientFrom} to-${gradientTo} p-8 text-center`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px',
                  }}
                  className="absolute inset-0"
                />
              </div>

              {/* Lock Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
              >
                <Lock className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                Unlock {title}
              </h3>
              <p className="text-white/90 text-base max-w-2xl mx-auto relative z-10">
                Create a free account to access this premium feature
              </p>

              {/* Benefit Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Free forever plan</span>
              </motion.div>
            </div>

            {/* Features List */}
            <CardContent className="p-8">
              <div className="space-y-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900">
                  What you'll get:
                </h4>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-100"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h5>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Ready to unlock this feature?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Create your free account in 30 seconds. No credit card required.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUnlock}
                    className={`flex-1 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} hover:opacity-90 text-white shadow-lg text-base py-6`}
                  >
                    <span className="flex items-center gap-2">
                      Unlock Now
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                  <Button
                    onClick={handleUnlock}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 py-6"
                  >
                    Learn More
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 pt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Free forever</span>
                  </div>
                  <span>•</span>
                  <span>No credit card</span>
                  <span>•</span>
                  <span>30 second signup</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* Signup Modal */}
      <SignupPromptModal
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        reason="collaborate"
      />
    </>
  );
}
