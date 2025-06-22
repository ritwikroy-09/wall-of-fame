"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function UnauthorizedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [message, setMessage] = useState<string | null>(null)
  
  useEffect(() => {
    setMessage(searchParams.get('message'))
  }, [searchParams])

  const handleDirectLogin = () => {
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const handleSSOLogin = () => {
    // Redirect to SDCMUJ SSO login
    window.location.href = `https://sdcmuj.com/login?redirect_uri=${encodeURIComponent(
      window.location.origin + '/api/auth/callback/sso?callbackUrl=' + encodeURIComponent(callbackUrl)
    )}`
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-6">
            Please log in to access this page
          </p>
          {message && <p className="text-center text-gray-700 mb-7">
            {message}
          </p>}
          <div className="space-y-4">
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleDirectLogin}
            >
              Login with Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSSOLogin}
              disabled={true}
            >
              Login with SDCMUJ SSO (Disabled)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-gray-500">
          You will be redirected back after successful login
        </CardFooter>
      </Card>
    </div>
  )
}
