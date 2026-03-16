import { createContext, useContext, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useDashboardData } from '@application/hooks/useDashboardData';

type DashboardContextType = ReturnType<typeof useDashboardData>;

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children?: ReactNode }) {
  const value = useDashboardData();
  return (
    <DashboardContext.Provider value={value}>
      {children || <Outlet />}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
