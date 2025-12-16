"use client"

import Link from "next/link"
import { UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          Prepline
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}