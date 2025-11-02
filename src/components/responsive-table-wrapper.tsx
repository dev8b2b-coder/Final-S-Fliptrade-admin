import React from 'react';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
}

export function ResponsiveTableWrapper({ children }: ResponsiveTableWrapperProps) {
  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {children}
      </div>
    </div>
  );
}
