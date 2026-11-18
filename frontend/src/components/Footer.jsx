import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center text-brand-navy font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                JobGuard <span className="text-brand-yellow">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An intelligent, transparent dual-engine decision-support system built for students and early-career jobseekers. 
              Powered by the EMSCAD dataset, Scikit-Learn TF-IDF classification pipelines, and internship fraud rule heuristics.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 max-w-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                <strong>Educational Notice:</strong> Predictions indicate statistical correlation. Always practice independent diligence before submitting personal data.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Pages</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-brand-yellow transition-colors">User Dashboard</Link></li>
              <li><Link to="/scanner" className="hover:text-brand-yellow transition-colors">Job Posting Scanner</Link></li>
              <li><Link to="/pdf-scanner" className="hover:text-brand-yellow transition-colors">PDF Ad Scanner</Link></li>
              <li><Link to="/history" className="hover:text-brand-yellow transition-colors">Analysis History</Link></li>
              <li><Link to="/model-insights" className="hover:text-brand-yellow transition-colors">Model Insights & Metrics</Link></li>
              <li><Link to="/about" className="hover:text-brand-yellow transition-colors">Methodology & Architecture</Link></li>
            </ul>
          </div>

          {/* Tech Stack / Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Architecture</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div>ML: <span className="text-slate-200">Scikit-Learn TF-IDF</span></div>
              <div>Backend: <span className="text-slate-200">FastAPI REST APIs</span></div>
              <div>Frontend: <span className="text-slate-200">React + Vite + Tailwind</span></div>
              <div>Auth & DB: <span className="text-slate-200">Firebase Auth & Firestore</span></div>
              <div>Document: <span className="text-slate-200">PyPDF Extraction</span></div>
              <div className="pt-2 text-[11px] text-slate-400">
                B.Tech Final Year / AI Mini-Project
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} JobGuard AI – AI-Powered Fake Job & Internship Detection Platform.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for Student Cyber Safety
          </div>
        </div>
      </div>
    </footer>
  );
};
