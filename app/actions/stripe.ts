'use server'

import { stripe } from '@/lib/stripe'

export async function startPaymentSession(
  amount: number,
  description: string,
  payerName: string,
  recipientName: string
) {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Payment to ${recipientName}`,
            description: `${description} - from ${payerName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  return session.client_secret
}
