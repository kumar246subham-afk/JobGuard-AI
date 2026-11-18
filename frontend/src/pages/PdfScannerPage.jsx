import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { historyService } from '../services/historyService';
import { 
  FileUp, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Lock,
  ArrowRight
} from 'lucide-react';

export const PdfScannerPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please upload a standard PDF (.pdf) document.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select or drop a PDF job advertisement to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await api.predictPdf(file);

      // Save to history
      await historyService.saveScan({
        ...result,
        job_title: file.name.replace('.pdf', ''),
        company_name: 'Extracted from PDF Ad',
        location: 'Document Scan',
        is_pdf_upload: true
      }, user);

      // Navigate to results
      navigate('/result', {
        state: {
          result,
          jobInfo: {
            title: file.name.replace('.pdf', ''),
            company_name: 'Extracted from PDF Document',
            description: 'Analyzed directly from uploaded PDF'
          }
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze PDF document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
          <FileUp className="w-6 h-6 text-amber-500" />
          PDF Job Advertisement Scanner
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload campus placement brochures, hiring flyers, or job offer letters in PDF format for automated text extraction and risk analysis.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900 text-xs">
        <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Privacy & In-Memory Processing Guarantee:</span>
          <p className="text-blue-800 leading-relaxed">
            Uploaded PDFs are parsed in-memory using <code className="bg-blue-100 px-1 py-0.5 rounded">pypdf</code>. 
            Files are <strong>never stored permanently on the server disk</strong>, preventing sensitive contact details from leaking.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">PDF Analysis Error</div>
            <div>{error}</div>
            {error.includes('ModelNotTrained') && (
              <div className="text-[11px] text-rose-700 pt-1">
                The ML model must be trained first. Place <code>fake_job_postings.csv</code> in <code>dataset/</code> and run <code>python -m backend.app.ml.train</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all shadow-sm ${
          dragActive
            ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          {file ? file.name : "Drag and drop your PDF here, or click to browse"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supports standard PDF documents containing selectable text (Maximum file size: 5 MB)
        </p>

        {file && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready for analysis: {(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>

      {/* Analyze Action */}
      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
              Extracting Text & Scoring Fraud Risk...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Analyze Uploaded PDF Document
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
