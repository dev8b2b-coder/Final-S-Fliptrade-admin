import React from 'react';

interface ShimmerSkeletonProps {
  className?: string;
}

export function ShimmerSkeleton({ className = '' }: ShimmerSkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-white to-gray-200"></div>
    </div>
  );
}

// Table skeleton loader with shimmer effect
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md border">
      <div className="overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gray-50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <ShimmerSkeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b p-4 last:border-b-0">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <ShimmerSkeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <ShimmerSkeleton className="h-6 w-1/3" />
      <ShimmerSkeleton className="h-4 w-1/2" />
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerSkeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

// Dashboard metrics skeleton
export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-6 space-y-3">
          <ShimmerSkeleton className="h-4 w-1/2" />
          <ShimmerSkeleton className="h-8 w-3/4" />
          <ShimmerSkeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

// Form skeleton loader
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <ShimmerSkeleton className="h-4 w-1/4" />
          <ShimmerSkeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 justify-end pt-4">
        <ShimmerSkeleton className="h-10 w-24" />
        <ShimmerSkeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// List skeleton loader
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-white">
          <ShimmerSkeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerSkeleton className="h-4 w-1/3" />
            <ShimmerSkeleton className="h-3 w-1/2" />
          </div>
          <ShimmerSkeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
