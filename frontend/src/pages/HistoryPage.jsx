import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { historyService } from '../services/historyService';
import { RiskBadge } from '../components/RiskBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  ExternalLink, 
  Filter, 
  AlertCircle,
  FileSearch,
  Calendar
} from 'lucide-react';

export const HistoryPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const records = await historyService.getScans(user);
      setScans(records || []);
    } catch (e) {
      console.warn("Failed to load history:", e);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await historyService.deleteScan(scanId, user);
      setScans(prev => prev.filter(s => s.id !== scanId && s.firestoreId !== scanId));
    } catch (e) {
      alert("Failed to delete record.");
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Are you sure you want to clear your local analysis history?")) return;
    historyService.clearScans(user?.uid || 'guest');
    setScans([]);
  };

  // Filtered scans
  const filteredScans = scans.filter(s => {
    const title = (s.job_title || s.title || '').toLowerCase();
    const company = (s.company_name || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = title.includes(query) || company.includes(query);

    const matchesRisk = filterRisk === 'ALL' || (s.risk_level || '').toUpperCase() === filterRisk;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-amber-500" />
            Analysis Audit History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect previously analyzed job advertisements.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
          >
            Clear Local History
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Risk:</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Risk Levels ({scans.length})</option>
            <option value="HIGH">High Risk ({scans.filter(s => s.risk_level === 'HIGH').length})</option>
            <option value="MEDIUM">Medium Risk ({scans.filter(s => s.risk_level === 'MEDIUM').length})</option>
            <option value="LOW">Low Risk ({scans.filter(s => s.risk_level === 'LOW').length})</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredScans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileSearch className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Matching Records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {scans.length === 0 
              ? "You haven't scanned any jobs yet. Run a scan to build your security history." 
              : "No records found matching your current search query or filter selection."}
          </p>
          <div className="pt-2">
            <Link
              to="/scanner"
              className="px-4 py-2 bg-brand-yellow text-brand-navy font-bold text-xs rounded-xl shadow-sm hover:bg-brand-yellow-dark transition-colors inline-block"
            >
              Scan a Job Posting Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Job Title & Company</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScans.map((scan) => {
                  const id = scan.id || scan.firestoreId;
                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{scan.job_title || scan.title || 'Untitled'}</div>
                        <div className="text-[11px] text-slate-500">{scan.company_name || 'Unspecified'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={scan.risk_level} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {scan.risk_score} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          scan.is_fraudulent ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {scan.prediction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(scan.createdAt || scan.analysis_date || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to="/result"
                          state={{ result: scan, jobInfo: scan }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
