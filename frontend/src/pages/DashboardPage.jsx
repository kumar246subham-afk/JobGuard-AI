import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';
import { RiskBadge } from '../components/RiskBadge';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileSearch, 
  FileText, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadUserScans = async () => {
      try {
        const records = await historyService.getScans(user);
        if (isMounted) {
          setScans(records || []);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setScans([]);
          setLoading(false);
        }
      }
    };
    loadUserScans();
    return () => { isMounted = false; };
  }, [user]);

  // Derive genuine statistics from real user scans
  const totalScans = scans.length;
  const suspiciousCount = scans.filter(s => s.is_fraudulent || s.prediction?.includes('Fraud') || s.risk_level === 'HIGH').length;
  const highRiskCount = scans.filter(s => s.risk_level === 'HIGH').length;
  const mediumRiskCount = scans.filter(s => s.risk_level === 'MEDIUM').length;
  const lowRiskCount = scans.filter(s => s.risk_level === 'LOW').length;
  const legitCount = totalScans - suspiciousCount;

  // Chart data: Risk Distribution
  const riskDistributionData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10B981' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#F59E0B' },
    { name: 'High Risk', value: highRiskCount, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // Group by scan month
  const monthlyData = scans.reduce((acc, scan) => {
    const date = new Date(scan.createdAt || scan.analysis_date || Date.now());
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === monthYear);
    if (existing) {
      existing.total += 1;
      if (scan.risk_level === 'HIGH') existing.highRisk += 1;
    } else {
      acc.push({
        month: monthYear,
        total: 1,
        highRisk: scan.risk_level === 'HIGH' ? 1 : 0
      });
    }
    return acc;
  }, []).reverse();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">
            Security Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fraud audit records for {user?.displayName || user?.email || 'Guest User'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/scanner"
            className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            New Job Scan
          </Link>
          <Link
            to="/pdf-scanner"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            Upload PDF
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scanned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scans</div>
            <div className="text-3xl font-black text-brand-navy mt-1">{totalScans}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Verified postings</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
        </div>

        {/* Legitimate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Legitimate</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{legitCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard listings</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Suspicious */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suspicious</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{suspiciousCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Flagged warning signs</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Scam</div>
            <div className="text-3xl font-black text-rose-600 mt-1">{highRiskCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Severe red flags detected</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts (When data exists) */}
      {totalScans > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Breakdown Pie */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-500" />
              Risk Level Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Over Time Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Scan History Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.length > 0 ? monthlyData : [{ month: 'Current', total: totalScans, highRisk: highRiskCount }]}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Scans" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="highRisk" name="High Risk Detected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FileSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Job Scans Recorded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You haven't scanned any job ads yet. Run your first analysis by typing in job parameters or uploading an internship offer PDF.
          </p>
          <div className="pt-2">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-extrabold text-xs shadow-sm transition-colors"
            >
              Analyze Your First Job Ad →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Scans Table */}
      {totalScans > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Job Analyses</h3>
            <Link to="/history" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Job Title & Company</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan.id || scan.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{scan.job_title || scan.title || 'Untitled Job'}</div>
                      <div className="text-[11px] text-slate-500">{scan.company_name || 'Unspecified Company'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={scan.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {scan.risk_score} / 100
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        scan.is_fraudulent ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {scan.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(scan.createdAt || scan.analysis_date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/result`}
                        state={{ result: scan, jobInfo: scan }}
                        className="text-amber-600 hover:text-amber-800 font-bold text-xs"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
