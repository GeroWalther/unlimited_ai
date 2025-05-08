'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    setSelectedTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (
          child?.type?.displayName === 'TabsList' ||
          child?.type?.displayName === 'TabsContent'
        ) {
          return React.cloneElement(child, {
            selectedTab,
            onSelect: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}
Tabs.displayName = 'Tabs';

export function TabsList({ className, children, selectedTab, onSelect }) {
  return (
    <div
      className={cn(
        'inline-flex w-full max-w-md bg-black/50 border border-purple-900/30 p-1 rounded-full overflow-hidden',
        className
      )}>
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName === 'TabsTrigger') {
          return React.cloneElement(child, {
            isSelected: selectedTab === child.props.value,
            onSelect,
          });
        }
        return child;
      })}
    </div>
  );
}
TabsList.displayName = 'TabsList';

export function TabsTrigger({
  className,
  value,
  children,
  isSelected,
  onSelect,
}) {
  return (
    <button
      className={cn(
        'flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-300',
        isSelected
          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]'
          : 'text-white/80 hover:text-white hover:bg-white/10',
        className
      )}
      style={{
        backgroundSize: isSelected ? '200% 100%' : 'auto',
        animation: isSelected ? 'gradientShift 3s linear infinite' : 'none',
      }}
      onClick={() => onSelect(value)}
      data-state={isSelected ? 'active' : 'inactive'}>
      {children}
    </button>
  );
}
TabsTrigger.displayName = 'TabsTrigger';

export function TabsContent({ className, value, children, selectedTab }) {
  if (value !== selectedTab) return null;

  return <div className={cn('mt-2', className)}>{children}</div>;
}
TabsContent.displayName = 'TabsContent';
