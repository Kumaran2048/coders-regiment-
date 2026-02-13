'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startPaymentSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export function PaymentCheckout({
  amount,
  description,
  payerName,
  recipientName,
}: {
  amount: number
  description: string
  payerName: string
  recipientName: string
}) {
  const fetchClientSecret = useCallback(
    () => startPaymentSession(amount, description, payerName, recipientName),
    [amount, description, payerName, recipientName]
  )

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
