import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@presentation/layouts/MainLayout';
import { DashboardLayout } from '@presentation/layouts/DashboardLayout';
import LoginPage from '@presentation/pages/LoginPage';
import { SchemaPage } from '@presentation/pages/SchemaPage';
import { NewAnalysisPage } from '@presentation/pages/NewAnalysisPage';
import { AdminPage } from '@presentation/pages/AdminPage';
import { GeralPage } from '@presentation/pages/dashboard/GeralPage';
import { ProcedimentosPage } from '@presentation/pages/dashboard/ProcedimentosPage';
import { GeograficoPage } from '@presentation/pages/dashboard/GeograficoPage';
import { OperadorasPage } from '@presentation/pages/dashboard/OperadorasPage';
import { FaixaEtariaPage } from '@presentation/pages/dashboard/FaixaEtariaPage';
import { HorasPage } from '@presentation/pages/dashboard/HorasPage';
import { AnaliticoPage } from '@presentation/pages/dashboard/AnaliticoPage';
import { MockDashboardTestPage } from '@presentation/pages/MockDashboardTestPage';
import { EChartsPreviewPage } from '@presentation/pages/EChartsPreviewPage';
import { DashboardProvider } from '@application/contexts/DashboardContext';
import { TooltipProvider } from '@ui/components/ui/tooltip';

export function AppRouter() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected — MainLayout */}
          <Route element={<MainLayout />}>
            <Route element={<DashboardProvider />}>
              {/* Dashboard — tab routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="geral" replace />} />
                <Route path="geral"           element={<GeralPage />} />
                <Route path="procedimentos"   element={<ProcedimentosPage />} />
                <Route path="geografico"      element={<GeograficoPage />} />
                <Route path="operadoras"      element={<OperadorasPage />} />
                <Route path="faixa-etaria"    element={<FaixaEtariaPage />} />
                <Route path="horas"           element={<HorasPage />} />
                <Route path="analitico"       element={<AnaliticoPage />} />
              </Route>

              {/* Other pages */}
              <Route path="/schema"        element={<SchemaPage />} />
              <Route path="/new-analysis"  element={<NewAnalysisPage />} />
              <Route path="/admin"         element={<AdminPage />} />
              <Route path="/analysis/new"  element={<Navigate to="/new-analysis" replace />} />
            </Route>

            {/* Mockup test — outside DashboardProvider */}
            <Route path="/dashboard-teste" element={<MockDashboardTestPage />} />
            <Route path="/echarts-preview" element={<EChartsPreviewPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
