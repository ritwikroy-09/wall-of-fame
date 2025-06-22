"use client"
import { Suspense } from 'react'
import UnauthorizedContent from '@/app/unauthorized/unauthorized-content'

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-screen">Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  )
}
