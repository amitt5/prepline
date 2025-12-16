"use client"

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp 
          routing="path" 
          path="/signup"
          signInUrl="/login"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  )
}

