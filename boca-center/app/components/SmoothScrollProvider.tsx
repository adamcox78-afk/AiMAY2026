'use client'

import { useLenis } from '@/app/hooks/useLenis'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useLenis()
  return <>{children}</>
}
