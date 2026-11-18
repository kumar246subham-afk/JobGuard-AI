import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobScannerPage } from './pages/JobScannerPage';
import { PdfScannerPage } from './pages/PdfScannerPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-brand-bg text-brand-navy">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/scanner" element={<JobScannerPage />} />
                <Route path="/pdf-scanner" element={<PdfScannerPage />} />
                <Route path="/result" element={<AnalysisResultPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/model-insights" element={<ModelInsightsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
