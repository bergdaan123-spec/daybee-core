'use client'

import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

export default function Card({
  children,
  className = '',
  onClick,
  padding = 'md',
  style,
}: CardProps) {
  const paddingMap = {
    sm: '12px',
    md: '20px',
    lg: '28px',
  }

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        padding: paddingMap[padding],
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow 0.15s ease' : undefined,
        ...style,
      }}
      className={className}
      onMouseEnter={
        onClick
          ? (e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)' }
          : undefined
      }
      onMouseLeave={
        onClick
          ? (e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)' }
          : undefined
      }
    >
      {children}
    </div>
  )
}
