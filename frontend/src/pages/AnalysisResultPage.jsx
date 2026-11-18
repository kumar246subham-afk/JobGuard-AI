import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { generatePdfReport } from '../services/pdfReport';
import { RiskBadge } from '../components/RiskBadge';
import { CompanyChecklist } from '../components/CompanyChecklist';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  Layers,
  BrainCircuit,
  FileText,
  Calendar
} from 'lucide-react';

export const AnalysisResultPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const result = state.result;
  const jobInfo = state.jobInfo || {};

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Analysis Result Loaded</h2>
        <p className="text-xs text-slate-500">Please scan a job listing or upload a PDF ad first.</p>
        <Link
          to="/scanner"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-yellow text-brand-navy font-bold text-xs rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Job Scanner
        </Link>
      </div>
    );
  }

  const isHighRisk = result.risk_level === 'HIGH';
  const isMedRisk = result.risk_level === 'MEDIUM';

  const handleDownload = () => {
    generatePdfReport(result, jobInfo);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation & Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scanner
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-brand-navy hover:bg-slate-800 text-brand-yellow font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {t.resDownloadPdf}
          </button>
        </div>
      </div>

      {/* Hero Assessment Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
        isHighRisk 
          ? 'bg-rose-50/70 border-rose-200' 
          : isMedRisk 
          ? 'bg-amber-50/70 border-amber-200' 
          : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <RiskBadge level={result.risk_level} size="lg" />
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {result.analysis_date}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {result.prediction}
            </h1>

            <div className="text-xs text-slate-600 max-w-xl">
              Position: <strong className="text-slate-900">{jobInfo.title || 'Job Ad'}</strong>
              {jobInfo.company_name && (
                <span> | Company: <strong className="text-slate-900">{jobInfo.company_name}</strong></span>
              )}
            </div>
          </div>

          {/* Risk Gauge Metric Display */}
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 min-w-[240px]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Composite Risk Score
              </div>
              <div className="text-3xl font-black text-brand-navy">
                {result.risk_score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                {result.risk_level} Risk Category
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-200" />

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ML Probability
              </div>
              <div className="text-xl font-extrabold text-slate-800">
                {(result.fraud_probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400">
                Conf: {result.confidence_score}%
              </div>
            </div>
          </div>
        </div>

        {/* Essential Note on Certainty */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Distinction:</strong> Machine Learning output reflects mathematical likelihood based on historical training patterns, not guaranteed factual truth or legal certification.
          </span>
        </div>
      </div>

      {/* Grid: Warning Signs & Company Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warning Signs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t.resWarningSigns} ({result.detected_warning_signs?.length || 0})
          </h3>

          {result.detected_warning_signs && result.detected_warning_signs.length > 0 ? (
            <ul className="space-y-2.5">
              {result.detected_warning_signs.map((sign, idx) => (
                <li key={idx} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                  <span className="font-bold text-rose-600 flex-shrink-0">⚠️</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>No severe heuristic warning patterns detected in this posting.</span>
            </div>
          )}
        </div>

        {/* Company Transparency Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            {t.resCompanyChecklist}
          </h3>
          <CompanyChecklist checklist={result.company_checklist} />
        </div>
      </div>

      {/* Explainable AI Factors */}
      {result.explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-amber-500" />
            Explainable AI (XAI) Feature Attribution
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            {result.explanation.ml_confidence_note}
          </p>

          {result.explanation.influential_keywords && result.explanation.influential_keywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Keyword / Bigram</th>
                    <th className="py-2.5 px-3">Impact Direction</th>
                    <th className="py-2.5 px-3">Statistical Weight</th>
                    <th className="py-2.5 px-3">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.explanation.influential_keywords.map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        "{kw.word}"
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          kw.direction.includes('Suspicious')
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {kw.direction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {kw.weight > 0 ? `+${kw.weight}` : kw.weight}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {kw.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-xl">
              {result.explanation.summary}
            </div>
          )}
        </div>
      )}

      {/* Safe URL Analysis Box if URL was provided */}
      {result.url_analysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-500" />
            Syntactic Domain & Link Analysis
          </h3>
          <div className="text-xs text-slate-600">
            Provided URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{result.url_analysis.provided_url}</code>
            {result.url_analysis.domain && (
              <span> | Domain: <strong className="text-slate-900">{result.url_analysis.domain}</strong></span>
            )}
          </div>
          {result.url_analysis.flags && result.url_analysis.flags.length > 0 && (
            <div className="space-y-1 pt-1">
              {result.url_analysis.flags.map((flag, idx) => (
                <div key={idx} className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  ⚠️ {flag}
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 italic">
            {result.url_analysis.note}
          </p>
        </div>
      )}

      {/* Safety Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t.resRecommendations}
        </h3>

        <div className="space-y-2">
          {result.safety_recommendations?.map((rec, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <span className="font-bold text-brand-navy flex-shrink-0">Step {idx + 1}:</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Disclaimer Card */}
      <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-1">
        <div className="font-bold text-slate-700">{t.resDisclaimer}:</div>
        <p>{result.disclaimer}</p>
      </div>
    </div>
  );
};
