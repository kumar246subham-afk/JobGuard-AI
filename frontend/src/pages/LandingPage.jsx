import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  FileUp, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Database,
  Lock,
  Layers,
  GraduationCap
} from 'lucide-react';

export const LandingPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    datasetFound: false,
    rowCount: null,
    isModelTrained: false,
    modelName: null,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSystemStats = async () => {
      try {
        const [datasetRes, modelRes] = await Promise.allSettled([
          api.getDatasetStatus(),
          api.getModelStatus()
        ]);

        if (isMounted) {
          const dsData = datasetRes.status === 'fulfilled' ? datasetRes.value : {};
          const mlData = modelRes.status === 'fulfilled' ? modelRes.value : {};

          setStats({
            datasetFound: Boolean(dsData.dataset_found),
            rowCount: dsData.row_count || null,
            isModelTrained: Boolean(mlData.is_trained),
            modelName: mlData.model_name || null,
            loading: false
          });
        }
      } catch (e) {
        if (isMounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchSystemStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-amber-50/60 via-brand-bg to-brand-bg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            AI & Rule-Based Scam Defense for Job Seekers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight max-w-4xl mx-auto leading-tight">
            {t.heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Call to action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t.heroScanNow}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/pdf-scanner"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <FileUp className="w-4 h-4 text-amber-500" />
              {t.heroUploadPdf}
            </Link>

            <Link
              to="/model-insights"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <BrainCircuit className="w-4 h-4 text-slate-400" />
              {t.heroExploreInsights}
            </Link>
          </div>

          {/* Model Status Real Pill */}
          <div className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            {stats.loading ? (
              <span>Connecting to JobGuard backend...</span>
            ) : stats.isModelTrained ? (
              <span className="text-emerald-700 font-medium">
                Production ML Pipeline Loaded: {stats.modelName || 'Logistic Regression (EMSCAD)'}
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                ML Pipeline Ready: Training pending dataset placement in <code className="bg-amber-100 px-1 py-0.5 rounded">dataset/fake_job_postings.csv</code>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Real System Stats Row (Strictly using genuine status, no fabricated numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Architecture & Dataset Status
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
                {stats.rowCount ? `${stats.rowCount.toLocaleString()} Jobs` : "17,880 Rows"}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                EMSCAD Dataset Target (Real Scam Corpus)
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center justify-center gap-1.5">
                <Layers className="w-6 h-6 text-amber-500" />
                Dual-Engine
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                TF-IDF ML Pipeline + Heuristic Scam Engine
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center justify-center gap-1.5">
                {stats.isModelTrained ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-2xl">
                    <CheckCircle className="w-6 h-6" /> Trained
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 text-2xl">
                    <Lock className="w-6 h-6" /> Pending Data
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {stats.isModelTrained ? "Fitted Artifact Active" : "Real Evaluation Ready on CSV Load"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A three-tier verification process designed to catch sophisticated job scams before students share personal data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-black text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t.howItWorksStep1}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.howItWorksStep1Desc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-black text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t.howItWorksStep2}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.howItWorksStep2Desc}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-black text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t.howItWorksStep3}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.howItWorksStep3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Engineering for Student Safety
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Engineered with explainable AI, strict privacy guards, and student placement assistance standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{t.featExplainableAI}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featExplainableAIDesc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{t.featInternshipRules}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featInternshipRulesDesc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FileUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{t.featPdfSupport}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featPdfSupportDesc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Company Checklist</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audits presence of registered company name, profile, website link, and authentic logo assets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Safe URL Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Syntactic domain inspector protects against SSRF and flags disposable or misleading TLDs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Downloadable Reports</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exports comprehensive PDF verification reports to present to college Placement Cells and faculty advisors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to verify a suspicious job ad?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Test with our instant manual scanner or upload an ad brochure in PDF format.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/scanner"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-black text-xs transition-colors shadow-md"
              >
                Launch Job Scanner
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
              >
                Learn Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
