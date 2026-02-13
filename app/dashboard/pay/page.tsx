import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaymentCheckout } from '@/components/payment-checkout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; to?: string; desc?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const params = await searchParams
  const amount = parseFloat(params.amount || '0')
  const recipientId = params.to || ''
  const description = params.desc || 'Group expense payment'

  if (!amount || !recipientId) {
    redirect('/dashboard/budget')
  }

  // Get profiles
  const { data: payerProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', recipientId)
    .single()

  const payerName = payerProfile?.display_name || user.email || 'User'
  const recipientName = recipientProfile?.display_name || 'Group member'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/budget"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Budget
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Send Payment</CardTitle>
          <CardDescription>
            Paying{' '}
            <span className="font-medium text-foreground">
              ${amount.toFixed(2)}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">{recipientName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentCheckout
            amount={amount}
            description={description}
            payerName={payerName}
            recipientName={recipientName}
          />
        </CardContent>
      </Card>
    </div>
  )
}
