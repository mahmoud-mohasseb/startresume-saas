import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { 
  getOrCreateUserSubscription, 
  getUserCreditAnalytics,
  SUBSCRIPTION_PLANS,
  CREDIT_COSTS
} from '@/lib/subscription-manager'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const includeComparison = searchParams.get('comparison') === 'true'

    console.log('Fetching analytics for user:', user.id, 'days:', days)

    // Get user subscription and analytics with improved error handling
    const [subscription, analytics] = await Promise.all([
      getOrCreateUserSubscription(user.id),
      getUserCreditAnalytics(user.id, days)
    ])
    
    console.log('Analytics data retrieved:', {
      subscriptionPlan: subscription.plan,
      totalCredits: subscription.credits,
      totalUsed: analytics.totalUsed,
      actionsTracked: Object.keys(analytics.usageByAction).length
    })
    
    // Find the plan details
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan)
    
    // Calculate remaining credits
    const remainingCredits = Math.max(0, subscription.credits - analytics.totalUsed)

    // Get comparison data if requested
    let comparisonData = null
    if (includeComparison) {
      try {
        const previousPeriodAnalytics = await getUserCreditAnalytics(user.id, days, days)
        comparisonData = {
          previousTotalUsed: previousPeriodAnalytics.totalUsed,
          usageChange: analytics.totalUsed - previousPeriodAnalytics.totalUsed,
          usageChangePercent: previousPeriodAnalytics.totalUsed > 0 
            ? Math.round(((analytics.totalUsed - previousPeriodAnalytics.totalUsed) / previousPeriodAnalytics.totalUsed) * 100)
            : analytics.totalUsed > 0 ? 100 : 0
        }
      } catch (error) {
        console.error('Error getting comparison data:', error)
        comparisonData = null
      }
    }

    // Calculate efficiency metrics
    const efficiencyMetrics = calculateEfficiencyMetrics(analytics, subscription.credits)

    // Get feature recommendations
    const recommendations = generateFeatureRecommendations(analytics, plan, remainingCredits)

    // Format daily usage for charts
    const dailyUsageChart = formatDailyUsageForChart(analytics.usageByDay, days)

    // Calculate projected usage
    const projectedUsage = calculateProjectedUsage(analytics.usageByDay, subscription.credits)

    console.log('Analytics calculation completed:', {
      totalCredits: subscription.credits,
      usedCredits: analytics.totalUsed,
      remainingCredits,
      projectedUsage: projectedUsage.projected,
      recommendationsCount: recommendations.length
    })

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        planName: plan?.name || subscription.plan,
        status: subscription.status,
        totalCredits: subscription.credits,
        usedCredits: analytics.totalUsed,
        remainingCredits,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id
      },
      analytics: {
        totalUsed: analytics.totalUsed,
        usageByAction: analytics.usageByAction,
        usageByDay: analytics.usageByDay,
        recentUsage: analytics.recentUsage,
        dailyUsageChart,
        projectedUsage,
        efficiencyMetrics
      },
      plan: plan ? {
        id: plan.id,
        name: plan.name,
        credits: plan.credits,
        price: plan.price,
        creditCost: plan.creditCost,
        features: plan.features,
        popular: plan.popular
      } : null,
      comparison: comparisonData,
      recommendations,
      insights: generateUsageInsights(analytics, subscription, plan),
      creditCosts: CREDIT_COSTS
    })

  } catch (error) {
    console.error('Error fetching user analytics:', error)
    
    // Return detailed error information
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : { message: 'Unknown error occurred' }

    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics information',
        details: errorDetails,
        userId: (await currentUser())?.id || 'unknown'
      },
      { status: 500 }
    )
  }
}

function calculateEfficiencyMetrics(analytics: any, totalCredits: number) {
  const usageRate = totalCredits > 0 ? (analytics.totalUsed / totalCredits) * 100 : 0
  const avgDailyUsage = Object.keys(analytics.usageByDay).length > 0 
    ? analytics.totalUsed / Object.keys(analytics.usageByDay).length 
    : 0

  return {
    usageRate: Math.round(usageRate),
    avgDailyUsage: Math.round(avgDailyUsage * 10) / 10,
    mostUsedFeature: Object.entries(analytics.usageByAction)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none',
    efficiency: usageRate > 80 ? 'high' : usageRate > 50 ? 'medium' : 'low'
  }
}

function generateFeatureRecommendations(analytics: any, plan: any, remainingCredits: number) {
  const recommendations = []

  // Low credits warning
  if (remainingCredits < 5) {
    recommendations.push({
      type: 'warning',
      title: 'Low Credits',
      message: 'You\'re running low on credits. Consider upgrading your plan.',
      action: 'upgrade',
      priority: 'high'
    })
  }

  // Underutilization
  const usageRate = plan ? (analytics.totalUsed / plan.credits) * 100 : 0
  if (usageRate < 30 && analytics.totalUsed > 0) {
    recommendations.push({
      type: 'info',
      title: 'Underutilized Plan',
      message: 'You\'re only using ' + Math.round(usageRate) + '% of your credits. Consider a lower plan.',
      action: 'downgrade',
      priority: 'medium'
    })
  }

  // Feature suggestions based on current plan
  const availableFeatures = Object.keys(CREDIT_COSTS)
  const unusedFeatures = availableFeatures.filter(feature => !analytics.usageByAction[feature])

  if (unusedFeatures.length > 0) {
    const featureName = unusedFeatures[0].replace(/_/g, ' ')
    recommendations.push({
      type: 'tip',
      title: 'Explore New Features',
      message: `Try ${featureName} to maximize your plan value.`,
      action: 'explore',
      priority: 'low'
    })
  }

  return recommendations
}

function formatDailyUsageForChart(usageByDay: Record<string, number>, days: number) {
  const today = new Date()
  const chartData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    chartData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      usage: usageByDay[dateStr] || 0,
      fullDate: dateStr
    })
  }

  return chartData
}

function calculateProjectedUsage(usageByDay: Record<string, number>, totalCredits: number) {
  const dailyUsages = Object.values(usageByDay)
  if (dailyUsages.length === 0) return { projected: 0, willExceed: false, daysRemaining: 30, avgDailyUsage: 0 }

  const avgDailyUsage = dailyUsages.reduce((sum, usage) => sum + usage, 0) / dailyUsages.length
  const daysInMonth = 30
  const projectedMonthlyUsage = avgDailyUsage * daysInMonth

  return {
    projected: Math.round(projectedMonthlyUsage),
    willExceed: projectedMonthlyUsage > totalCredits,
    daysRemaining: avgDailyUsage > 0 ? Math.floor(totalCredits / avgDailyUsage) : 999,
    avgDailyUsage: Math.round(avgDailyUsage * 10) / 10
  }
}

function generateUsageInsights(analytics: any, subscription: any, plan: any) {
  const insights = []

  // Usage pattern insights
  const recentUsage = analytics.recentUsage.slice(0, 7)
  if (recentUsage.length > 0) {
    const recentDays = [...new Set(recentUsage.map((u: any) => 
      new Date(u.timestamp).toDateString()
    ))].length

    if (recentDays <= 2) {
      insights.push({
        type: 'pattern',
        message: 'You\'ve been very active recently! Most usage in the last 2 days.',
        icon: '🔥'
      })
    }
  }

  // Plan optimization
  const usageRate = (analytics.totalUsed / subscription.credits) * 100
  if (usageRate > 90) {
    insights.push({
      type: 'optimization',
      message: 'You\'re maximizing your plan! Consider upgrading for more credits.',
      icon: '📈'
    })
  } else if (usageRate < 20) {
    insights.push({
      type: 'optimization',
      message: 'You have plenty of credits left. Perfect for trying new features!',
      icon: '✨'
    })
  }

  // Feature diversity
  const featuresUsed = Object.keys(analytics.usageByAction).length
  if (featuresUsed >= 3) {
    insights.push({
      type: 'achievement',
      message: `Great job exploring ${featuresUsed} different AI features!`,
      icon: '🎯'
    })
  }

  return insights
}