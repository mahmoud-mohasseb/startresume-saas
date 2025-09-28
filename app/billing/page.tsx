  const handleUpgrade = async (planId: string) => {
    try {
      setUpgradeLoading(planId)
      console.log('Starting checkout for plan:', planId)
      
      const plan = PLANS.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Plan not found')
      }

      console.log('Plan details:', plan)
      console.log('Stripe Price ID:', plan.stripePriceId)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`
        })
      })

      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', errorData)
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      console.log('Checkout session data:', data)
      
      if (!data.url) {
        throw new Error('No checkout URL received')
      }

      console.log('Redirecting to:', data.url)
      window.location.href = data.url
      
    } catch (error) {
      console.error('Checkout Error Details:', error)
      
      // Show more specific error messages
      let errorMessage = 'Failed to start checkout. '
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage += 'Please sign in and try again.'
        } else if (error.message.includes('400')) {
          errorMessage += 'Invalid plan selected.'
        } else if (error.message.includes('500')) {
          errorMessage += 'Server error. Please check your Stripe configuration.'
        } else {
          errorMessage += error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setUpgradeLoading(null)
    }
  }
