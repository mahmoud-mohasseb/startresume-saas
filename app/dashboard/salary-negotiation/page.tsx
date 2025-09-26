'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, MessageSquare, FileText, BarChart3, CheckCircle, Search, ExternalLink, Zap, Database, Globe, Clock, Award } from 'lucide-react';
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface SalaryData {
  jobTitle: string;
  experience: string;
  location: string;
  currentSalary: string;
  targetSalary: string;
  industry: string;
  companySize: string;
}

interface MarketData {
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  averageSalary: number;
  marketTrend: 'up' | 'down' | 'stable';
}

function SalaryNegotiationPageContent() {
  const { user } = useUser()
  const { useAIFeature, canUseFeature } = useSubscription()
  const [activeTab, setActiveTab] = useState('assessment');
  const [salaryData, setSalaryData] = useState<SalaryData>({
    jobTitle: '',
    experience: '',
    location: '',
    currentSalary: '',
    targetSalary: '',
    industry: '',
    companySize: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [negotiationStrategy, setNegotiationStrategy] = useState<string>('');

  const tabs = [
    { id: 'assessment', label: 'Salary Assessment', icon: Target },
    { id: 'market', label: 'Market Research', icon: BarChart3 },
    { id: 'strategy', label: 'Negotiation Strategy', icon: MessageSquare },
    { id: 'scripts', label: 'Scripts & Templates', icon: FileText }
  ];

  const handleAnalyzeSalary = async () => {
    // Check if user can use the feature
    if (!canUseFeature('salary_research')) {
      toast.error('This feature is not available in your current plan. Please upgrade to continue.')
      return
    }

    setIsAnalyzing(true);

    try {
      console.log('🚀 Starting salary analysis...')
      
      const success = await useAIFeature(
        'salary_research',
        () => fetch('/api/salary-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salaryData)
        }),
        (result) => {
          // Success callback
          console.log('✅ Salary analysis completed:', result)
          
          if (result.insights) {
            setMarketData({
              percentile25: result.insights.percentiles.p25,
              percentile50: result.insights.percentiles.p50,
              percentile75: result.insights.percentiles.p75,
              percentile90: result.insights.percentiles.p90,
              averageSalary: result.insights.averageSalary,
              marketTrend: result.insights.marketTrend === 'increasing' ? 'up' : 
                           result.insights.marketTrend === 'decreasing' ? 'down' : 'stable'
            });
            
            console.log('📊 Market data set:', result.insights)
          }
          
          if (result.strategy) {
            setNegotiationStrategy(result.strategy);
            console.log('💡 Strategy set, length:', result.strategy.length)
          }
          
          setActiveTab('market');
          toast.success('Salary analysis completed successfully!')
        },
        (error) => {
          // Error callback
          console.error('❌ Salary analysis failed:', error);
          toast.error('Failed to analyze salary. Please try again.')
        }
      )

      if (!success) {
        toast.error('Failed to analyze salary. Please check your plan and try again.')
      }
    } catch (error) {
      console.error('❌ Salary analysis failed:', error);
      toast.error('Failed to analyze salary. Please try again.')
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                AI Salary Negotiation Coach
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Real-time market research powered by AI for data-driven salary negotiations
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-2 dark:bg-gray-800/70">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-gray-800/70 dark:border-gray-600/20">
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Salary Assessment</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={salaryData.jobTitle}
                    onChange={(e) => setSalaryData({...salaryData, jobTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    value={salaryData.experience}
                    onChange={(e) => setSalaryData({...salaryData, experience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-15">11-15 years</option>
                    <option value="15+">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={salaryData.location}
                    onChange={(e) => setSalaryData({...salaryData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Salary
                  </label>
                  <input
                    type="text"
                    value={salaryData.currentSalary}
                    onChange={(e) => setSalaryData({...salaryData, currentSalary: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="e.g., $120,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Salary
                  </label>
                  <input
                    type="text"
                    value={salaryData.targetSalary}
                    onChange={(e) => setSalaryData({...salaryData, targetSalary: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="e.g., $150,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <select
                    value={salaryData.industry}
                    onChange={(e) => setSalaryData({...salaryData, industry: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="consulting">Consulting</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAnalyzeSalary}
                disabled={isAnalyzing || !salaryData.jobTitle || !salaryData.experience || !salaryData.location}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Researching Live Market Data...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Start AI Market Research
                  </div>
                )}
              </button>
            </div>
          )}

          {activeTab === 'market' && marketData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Market Research</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                  <div className="text-green-600 dark:text-green-400 text-sm font-medium">25th Percentile</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${marketData.percentile25.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                  <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Median (50th)</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    ${marketData.percentile50.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                  <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">75th Percentile</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    ${marketData.percentile75.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl">
                  <div className="text-orange-600 dark:text-orange-400 text-sm font-medium">90th Percentile</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    ${marketData.percentile90.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Market Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${marketData.averageSalary.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Average Salary</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      marketData.marketTrend === 'up' ? 'text-green-600 dark:text-green-400' :
                      marketData.marketTrend === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {marketData.marketTrend === 'up' ? '↗' : marketData.marketTrend === 'down' ? '↘' : '→'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Market Trend</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {salaryData.targetSalary ? Math.round(((parseInt(salaryData.targetSalary.replace(/[^0-9]/g, '')) - marketData.percentile50) / marketData.percentile50) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Above Median</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && negotiationStrategy && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Negotiation Strategy</h2>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {negotiationStrategy}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Do's</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>• Research market rates thoroughly</li>
                    <li>• Highlight your achievements</li>
                    <li>• Be confident but respectful</li>
                    <li>• Consider total compensation</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                  <Award className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Don'ts</h4>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    <li>• Don't make ultimatums</li>
                    <li>• Don't negotiate too early</li>
                    <li>• Don't focus only on salary</li>
                    <li>• Don't be unprepared</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Timing</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• After receiving job offer</li>
                    <li>• During performance reviews</li>
                    <li>• When taking on new responsibilities</li>
                    <li>• After completing major projects</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Negotiation Scripts & Templates</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Initial Salary Negotiation</h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    "Thank you for the offer. I'm excited about the opportunity to join [Company]. Based on my research and experience in [specific skills/achievements], I was hoping we could discuss the salary. The market rate for this position with my background appears to be in the range of $X to $Y. Would there be flexibility to adjust the offer to $Z?"
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Performance Review Negotiation</h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    "I'd like to discuss my compensation based on my performance this year. I've [specific achievements and impact]. Given my contributions and the market rate for my role, I believe a salary adjustment to $X would be appropriate. Can we explore this?"
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Counter-Offer Response</h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    "I appreciate the revised offer. While the salary is closer to what I was hoping for, I was wondering if we could also discuss [benefits/PTO/flexible work]. The total package would help me make this decision with confidence."
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalaryNegotiationPage() {
  return (
    <PlanBasedFeatureGuard feature="salary_research">
      <SalaryNegotiationPageContent />
    </PlanBasedFeatureGuard>
  );
}