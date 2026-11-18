import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  BrainCircuit, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2, 
  Layers, 
  FileText, 
  Terminal,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const ModelInsightsPage = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [datasetStatus, setDatasetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadInsights = async () => {
      try {
        const [mStatus, dStatus] = await Promise.all([
          api.getModelStatus(),
          api.getDatasetStatus()
        ]);
        if (isMounted) {
          setModelStatus(mStatus);
          setDatasetStatus(dStatus);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve model insights.');
          setLoading(false);
        }
      }
    };
    loadInsights();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const isTrained = Boolean(modelStatus?.is_trained);
  const metrics = modelStatus?.metrics;
  const isDatasetFound = Boolean(datasetStatus?.dataset_found);

  // Confusion matrix calculation
  const cm = metrics?.confusion_matrix || {};
  const tp = cm.true_positive || 0;
  const tn = cm.true_negative || 0;
  const fp = cm.false_positive || 0;
  const fn = cm.false_negative || 0;

  // Comparison data
  const comparisonData = metrics?.model_comparisons || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
          <Activity className="w-4 h-4" /> Machine Learning Engine Audit
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy mt-1">
          Model Insights & Real Evaluation Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transparent metrics computed strictly from genuine training evaluations. No fabricated numbers.
        </p>
      </div>

      {/* Dataset & Training State Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              EMSCAD Dataset Status
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isDatasetFound ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {isDatasetFound ? 'CSV Present' : 'Dataset Pending'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {datasetStatus?.message}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 font-mono">
            <div>Target File: <span className="text-slate-800">dataset/fake_job_postings.csv</span></div>
            {datasetStatus?.row_count && (
              <div>Genuine Rows: <span className="text-slate-800">{datasetStatus.row_count.toLocaleString()} entries</span></div>
            )}
            {datasetStatus?.fraudulent_percentage !== undefined && (
              <div>Class Imbalance: <span className="text-rose-600">{datasetStatus.fraudulent_percentage}% Fraudulent</span></div>
            )}
          </div>
        </div>

        {/* Model State Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-amber-500" />
              Production Pipeline Status
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isTrained ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {isTrained ? 'Fitted & Active' : 'Training Pending'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {modelStatus?.message}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 font-mono">
            <div>Pipeline Artifact: <span className="text-slate-800">backend/models/jobguard_pipeline_v1.joblib</span></div>
            <div>Model Algorithm: <span className="text-slate-800">Balanced Logistic Regression + TF-IDF (10k ngrams)</span></div>
          </div>
        </div>
      </div>

      {/* If Model is NOT trained yet: Clear, actionable terminal instructions */}
      {!isTrained && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-brand-navy rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex items-center gap-2 font-black text-lg">
            <Terminal className="w-6 h-6" />
            Dataset Setup & Model Training Instructions
          </div>
          <p className="text-xs font-medium leading-relaxed max-w-3xl">
            To ensure academic rigor and honesty, JobGuard AI refuses to fabricate synthetic records or invent fake accuracy numbers. 
            Once you place the real EMSCAD CSV file in the dataset directory, run the command below to train the full pipeline:
          </p>

          <div className="bg-brand-navy text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner space-y-2">
            <div className="text-slate-400"># 1. Place fake_job_postings.csv into dataset/</div>
            <div className="text-slate-400"># 2. Execute training module from project root:</div>
            <div className="text-brand-yellow font-bold">python -m backend.app.ml.train</div>
          </div>

          <div className="text-[11px] font-semibold text-brand-navy/90">
            Training automatically evaluates Stratified 5-Fold Cross Validation, generates confusion matrix plots, compares Linear SVM and Naive Bayes benchmarks, and saves the production artifact.
          </div>
        </div>
      )}

      {/* If Model IS trained: Display genuine evaluation metrics */}
      {isTrained && metrics && (
        <div className="space-y-8">
          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall Accuracy</div>
              <div className="text-3xl font-black text-brand-navy mt-1">{(metrics.accuracy * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Test Partition</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fraud Precision</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">{(metrics.precision_fraud * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pos-Label Precision</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fraud Recall</div>
              <div className="text-3xl font-black text-blue-600 mt-1">{(metrics.recall_fraud * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pos-Label Recall</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fraud F1-Score</div>
              <div className="text-3xl font-black text-purple-600 mt-1">{metrics.f1_fraud.toFixed(3)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Harmonic Mean</div>
            </div>
          </div>

          {/* Confusion Matrix and Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-500" />
                Confusion Matrix (Held-out Test Evaluation)
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-slate-500 font-semibold">True Negatives (TN)</div>
                  <div className="text-2xl font-black text-emerald-800 mt-1">{tn.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600">Correctly identified Legitimate</div>
                </div>

                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="text-slate-500 font-semibold">False Positives (FP)</div>
                  <div className="text-2xl font-black text-rose-800 mt-1">{fp.toLocaleString()}</div>
                  <div className="text-[10px] text-rose-600">Legitimate flagged as Fraud</div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-slate-500 font-semibold">False Negatives (FN)</div>
                  <div className="text-2xl font-black text-amber-800 mt-1">{fn.toLocaleString()}</div>
                  <div className="text-[10px] text-amber-600">Fraudulent missed</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-slate-500 font-semibold">True Positives (TP)</div>
                  <div className="text-2xl font-black text-blue-800 mt-1">{tp.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-600">Correctly caught Scam</div>
                </div>
              </div>
            </div>

            {/* Benchmark Comparison Chart */}
            {comparisonData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Model Comparison Benchmarks
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <XAxis dataKey="model_name" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="f1_fraud" name="Fraud F1" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recall_fraud" name="Fraud Recall" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
