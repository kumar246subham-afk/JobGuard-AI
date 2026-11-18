import React from 'react';
import { 
  Info, 
  Target, 
  Database, 
  Cpu, 
  AlertTriangle, 
  Compass, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  Code2
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
          <Info className="w-4 h-4" /> Academic & Architectural Documentation
        </div>
        <h1 className="text-3xl font-black text-brand-navy mt-1">
          About JobGuard AI
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          AI-Powered Fake Job & Internship Detection Platform – Engineering Overview & Capstone Project Scope
        </p>
      </div>

      {/* 1. Problem Statement */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-500" />
          1. Problem Statement
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The rapid transition to virtual hiring, remote internships, and digital job boards has triggered a 
          dramatic surge in employment scams. Fraudulent actors impersonate legitimate organizations, soliciting 
          unwarranted registration fees, laptop security deposits, or harvesting sensitive personal credentials 
          (Aadhaar, Social Security, Bank routing information) from college students and desperate job seekers.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Students often lack the institutional tooling to cross-reference corporate domain validity, lexical scam patterns, 
          and statistical warning signals before committing their time, financial resources, and confidential documents.
        </p>
      </section>

      {/* 2. Project Objectives */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          2. Core Objectives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
            <span className="font-bold text-amber-500">01.</span>
            <span>Provide an intuitive, multi-modal interface accepting manual forms, pasted text, and PDF brochures.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
            <span className="font-bold text-amber-500">02.</span>
            <span>Deliver dual-engine analysis combining Scikit-Learn TF-IDF pipelines with heuristic internship scam detectors.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
            <span className="font-bold text-amber-500">03.</span>
            <span>Enforce Explainable AI (XAI) feature attribution, allowing students to inspect exactly why an ad is suspicious.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
            <span className="font-bold text-amber-500">04.</span>
            <span>Maintain an audit trail of analyzed jobs integrated with Firebase Firestore and local storage.</span>
          </div>
        </div>
      </section>

      {/* 3. The Dataset */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          3. Dataset Specification (EMSCAD)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The system is architected around the <strong>Employment Scam Aegean Dataset (EMSCAD)</strong>, published by the 
          University of the Aegean. It contains approximately 17,880 real-world job advertisements annotated with binary ground truth 
          (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">fraudulent = 0</code> for legitimate, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">fraudulent = 1</code> for fake).
        </p>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Academic Integrity Notice:</strong> JobGuard AI adheres to strict data integrity standards. It does not 
          fabricate fake training records or report artificial accuracy. The model evaluation pipeline calculates actual test metrics 
          once the CSV is placed in the designated workspace directory.
        </div>
      </section>

      {/* 4. Methodology & ML Architecture */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-500" />
          4. Machine Learning Methodology
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The ML pipeline combines unstructured natural language processing with structured categorical metadata:
        </p>
        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-2 leading-relaxed">
          <li><strong>Preprocessing & Cleaning:</strong> Strips HTML tags, decodes character entities, normalizes URLs and emails into semantic tokens, and cleans text using regular expressions.</li>
          <li><strong>Feature Engineering:</strong> Uses sublinear TF-IDF vectorization with unigrams and bigrams (up to 10,000 features), combined with structured attributes (logo availability, screening questions, company profile completeness).</li>
          <li><strong>Class Imbalance Mitigation:</strong> Because fraudulent postings comprise ~4.8% of typical job listings, models are trained with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">class_weight='balanced'</code> and evaluated on Fraud Recall and PR-AUC rather than raw accuracy alone.</li>
          <li><strong>Benchmarking:</strong> System compares Balanced Logistic Regression against Calibrated Linear SVM and Multinomial Naive Bayes.</li>
        </ul>
      </section>

      {/* 5. Technology Stack */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          5. Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Frontend</div>
            <div className="text-slate-500 mt-0.5">React.js, Vite, Tailwind CSS, Recharts, Lucide</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Backend API</div>
            <div className="text-slate-500 mt-0.5">FastAPI, Uvicorn, Pydantic, Python 3.13</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">ML & NLP</div>
            <div className="text-slate-500 mt-0.5">Scikit-Learn, Pandas, NumPy, NLTK, Joblib</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-800">Cloud Auth & Storage</div>
            <div className="text-slate-500 mt-0.5">Firebase Auth, Cloud Firestore, PyPDF</div>
          </div>
        </div>
      </section>

      {/* 6. Limitations */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          6. System Limitations
        </h2>
        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-2 leading-relaxed">
          <li><strong>Statistical vs Legal Proof:</strong> Machine learning predictions represent probabilistic similarity to past scams, not legally admissible proof of innocence or guilt.</li>
          <li><strong>Language Coverage:</strong> The ML model is currently trained on English job text. Non-English postings should be evaluated with manual diligence.</li>
          <li><strong>Syntactic Domain Inspection:</strong> URL scanning is syntactic to avoid Server-Side Request Forgery (SSRF); it does not crawl dynamic third-party web content.</li>
        </ul>
      </section>

      {/* 7. Future Scope */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-500" />
          7. Future Scope
        </h2>
        <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
          <div>• Integration with live corporate registries (e.g. Ministry of Corporate Affairs, SEC EDGAR).</div>
          <div>• Multi-lingual Transformer models (mBERT / IndicBERT) for regional Indian and international languages.</div>
          <div>• Browser extension for real-time overlay alerts directly on LinkedIn, Indeed, and Internshala job pages.</div>
        </div>
      </section>
    </div>
  );
};
