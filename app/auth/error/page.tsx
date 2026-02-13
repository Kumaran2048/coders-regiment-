import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              FreshCart
            </span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-display">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center">
                {params?.error
                  ? `Error: ${params.error}`
                  : 'An unspecified error occurred.'}
              </p>
              <Button asChild>
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
