'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { CreditCard, Crown, Zap, Star, ArrowRight, Check, X, Loader2 } from 'lucide-react';

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Billing & Subscription
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your career growth
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <Star className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                $9.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">50 uses per month</p>
            </div>
            <button
              className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              onClick={() => handleSelectPlan('basic')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Choose Basic'}
            </button>
          </div>

          {/* Standard Plan */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-blue-500 scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Standard</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                $19.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">200 uses per month</p>
            </div>
            <button
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              onClick={() => handleSelectPlan('standard')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Choose Standard'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                $49.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Unlimited usage</p>
            </div>
            <button
              className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              onClick={() => handleSelectPlan('pro')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Choose Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
