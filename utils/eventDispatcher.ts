// Event dispatcher utility for subscription updates
export const dispatchSubscriptionUpdate = () => {
  if (typeof window !== 'undefined') {
    console.log('🔔 Dispatching subscription update event')
    window.dispatchEvent(new CustomEvent('subscription-updated'))
  }
}

export const dispatchCreditsUpdate = () => {
  if (typeof window !== 'undefined') {
    console.log('🔔 Dispatching credits update event')
    window.dispatchEvent(new CustomEvent('credits-updated'))
  }
}

export const dispatchPaymentSuccess = () => {
  if (typeof window !== 'undefined') {
    console.log('🔔 Dispatching payment success event')
    window.dispatchEvent(new CustomEvent('payment-success'))
  }
}

export const dispatchPlanChange = () => {
  if (typeof window !== 'undefined') {
    console.log('🔔 Dispatching plan change event')
    window.dispatchEvent(new CustomEvent('plan-changed'))
  }
}
