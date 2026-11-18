import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { historyService } from '../services/historyService';
import { 
  FileSearch, 
  RotateCcw, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Building,
  Briefcase,
  MapPin,
  GraduationCap
} from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  company_name: '',
  company_profile: '',
  description: '',
  requirements: '',
  benefits: '',
  location: '',
  employment_type: 'Full-time',
  required_experience: 'Entry level',
  required_education: "Bachelor's Degree",
  industry: 'Information Technology',
  function: 'Engineering',
  website_url: '',
  telecommuting: 0,
  has_company_logo: 1,
  has_questions: 1
};

// Preset samples for fast college evaluation & demonstration
const LEGIT_SAMPLE = {
  title: 'Junior Software Engineer (Cloud Services)',
  company_name: 'Nexus Cloud Technologies',
  company_profile: 'Nexus Cloud Technologies is an established enterprise SaaS provider offering scalable microservice orchestration infrastructure for Fortune 500 organizations.',
  description: 'We are seeking an enthusiastic Junior Software Engineer to assist in designing robust APIs and maintaining our cloud distributed data pipelines.',
  requirements: 'B.Tech/B.E. in Computer Science or related engineering discipline. Experience with Python, relational databases, REST APIs, and version control with Git.',
  benefits: 'Comprehensive health coverage, Provident Fund, competitive starting stipend, ongoing mentorship programs, and modern hardware setup.',
  location: 'Bangalore, Karnataka, IN',
  employment_type: 'Full-time',
  required_experience: 'Entry level',
  required_education: "Bachelor's Degree",
  industry: 'Information Technology',
  function: 'Engineering',
  website_url: 'https://nexuscloud-tech.example.com',
  telecommuting: 1,
  has_company_logo: 1,
  has_questions: 1
};

const SCAM_SAMPLE = {
  title: 'Data Entry Assistant - Immediate Work From Home ($400/day)',
  company_name: '',
  company_profile: '',
  description: 'Urgent hiring! Earn $400 daily doing simple copy paste work and form filling from mobile. 100% guaranteed job offer without any technical interview! Everyone who applies gets selected immediately.',
  requirements: 'No experience needed. Minimum age 18. Must have smartphone or laptop. To secure your slot, a mandatory registration fee of $50 is required before onboarding materials are dispatched.',
  benefits: 'Earn unlimited daily cash bonuses via direct bank transfer or cryptocurrency. Work only 1 hour daily.',
  location: 'Remote / Work From Home',
  employment_type: 'Part-time',
  required_experience: 'Not Applicable',
  required_education: 'Unspecified',
  industry: 'General',
  function: 'Administrative',
  website_url: 'http://quick-rich-typing-jobs.top',
  telecommuting: 1,
  has_company_logo: 0,
  has_questions: 0
};

export const JobScannerPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const loadPreset = (preset) => {
    setForm(preset);
    setError('');
  };

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!form.description.trim() || form.description.length < 10) {
      setError('Job Description must be at least 10 characters long.');
      return;
    }

    try {
      setLoading(true);
      const result = await api.predictJob(form);

      // Save to user history
      await historyService.saveScan({
        ...result,
        job_title: form.title,
        company_name: form.company_name,
        location: form.location,
        submittedForm: form
      }, user);

      // Navigate to detailed result view
      navigate('/result', { state: { result, jobInfo: form } });
    } catch (err) {
      setError(err.message || 'Analysis failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-amber-500" />
            {t.scannerHeading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.scannerSubheading}
          </p>
        </div>

        {/* Preset Sample Loaders */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadPreset(LEGIT_SAMPLE)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            {t.btnLoadSampleLegit}
          </button>
          <button
            type="button"
            onClick={() => loadPreset(SCAM_SAMPLE)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            {t.btnLoadSampleScam}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Scan Execution Blocked</div>
            <div>{error}</div>
            {error.includes('ModelNotTrained') && (
              <div className="text-[11px] text-rose-700 pt-1">
                To train the production model, place <code>fake_job_postings.csv</code> in <code>dataset/</code> and execute <code>python -m backend.app.ml.train</code> in your terminal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Core Job Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Core Job Identifiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fieldJobTitle} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer Intern"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fieldCompanyName}
              </label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. TechCorp Solutions"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.fieldCompanyProfile}
            </label>
            <textarea
              name="company_profile"
              rows={2}
              value={form.company_profile}
              onChange={handleChange}
              placeholder="Overview of the company, its mission, founding year, or business domain..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Job Content Body */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Ad Description & Specifications
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.fieldDescription} <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Paste the primary job advertisement text, responsibilities, and daily duties..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fieldRequirements}
              </label>
              <textarea
                name="requirements"
                rows={3}
                value={form.requirements}
                onChange={handleChange}
                placeholder="Key skills, programming languages, qualifications, certifications..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fieldBenefits}
              </label>
              <textarea
                name="benefits"
                rows={3}
                value={form.benefits}
                onChange={handleChange}
                placeholder="Stipend, insurance, perks, flexible timings, equipment allowances..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Structured Classification Metadata */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Structured Parameters & Verification Assets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fieldLocation}</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA, US"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fieldEmploymentType}</label>
              <select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fieldExperience}</label>
              <select
                name="required_experience"
                value={form.required_experience}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white"
              >
                <option value="Entry level">Entry level / Student</option>
                <option value="Associate">Associate</option>
                <option value="Mid-Senior level">Mid-Senior level</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fieldEducation}</label>
              <input
                type="text"
                name="required_education"
                value={form.required_education}
                onChange={handleChange}
                placeholder="e.g. Bachelor's Degree"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fieldWebsiteUrl}</label>
              <input
                type="text"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
                placeholder="https://company-domain.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox Attributes */}
          <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="has_company_logo"
                checked={form.has_company_logo === 1}
                onChange={handleChange}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
              />
              <span>Corporate Logo Present in Ad</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="has_questions"
                checked={form.has_questions === 1}
                onChange={handleChange}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
              />
              <span>Screening Questions Included</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="telecommuting"
                checked={form.telecommuting === 1}
                onChange={handleChange}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
              />
              <span>Remote / Telecommuting Allowed</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.btnClear}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark text-brand-navy font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                Processing ML Pipeline & Risk Engine...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t.btnAnalyze}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
