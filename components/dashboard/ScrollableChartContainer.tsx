'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScrollableChartContainerProps {
  dataLength: number;
  itemHeight?: number;
  minHeight?: number;
  maxViewportHeight?: number;
  threshold?: number;
  itemName?: string;
  showBadge?: boolean;
  className?: string;
  children: React.ReactNode | ((calculatedHeight: number) => React.ReactNode);
}

export function ScrollableChartContainer({
  dataLength,
  itemHeight = 44,
  minHeight = 280,
  maxViewportHeight = 480,
  threshold = 8,
  itemName = 'items',
  showBadge = false,
  className,
  children,
}: ScrollableChartContainerProps) {
  const isScrollable = dataLength > threshold;
  const calculatedHeight = isScrollable ? Math.max(minHeight, dataLength * itemHeight) : minHeight;

  return (
    <div className={cn('relative w-full min-w-0 space-y-1.5', className)}>
      {/* Scroll indicator badge if enabled and threshold exceeded */}
      {showBadge && isScrollable && (
        <div className="flex justify-end pb-1">
          <Badge
            variant="secondary"
            className="text-[10px] font-normal text-muted-foreground bg-muted/60 border border-border"
          >
            Scroll to explore all {dataLength} {itemName}
          </Badge>
        </div>
      )}

      {/* Viewport container */}
      <div
        className={cn(
          'w-full min-w-0',
          isScrollable
            ? 'overflow-y-auto overflow-x-hidden pr-1.5 scrollbar-thin'
            : ''
        )}
        style={isScrollable ? { maxHeight: `${maxViewportHeight}px` } : undefined}
      >
        <div style={{ height: `${calculatedHeight}px` }} className="w-full min-w-0">
          {typeof children === 'function' ? children(calculatedHeight) : children}
        </div>
      </div>
    </div>
  );
}
