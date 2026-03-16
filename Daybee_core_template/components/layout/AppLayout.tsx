'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type AppLayoutProps = {
  children: React.ReactNode
  title: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ flex: 1, padding: '32px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
