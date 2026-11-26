import React, { useCallback, useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  KeyRound,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const STATUS_OPTIONS = [
  'Application Received',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Offer Letter Issued',
  'Rejected',
] as const;

interface AdminJob {
  id: number;
  slug: string;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange: string;
  isActive: boolean;
}

interface AdminApplication {
  id: number;
  applicationId: string;
  positionTitle: string;
  department: string;
  location: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeOriginalName: string;
  status: string;
  internalNotes: string;
  offerStatus: 'not_issued' | 'issued' | 'revoked';
  offerIssueDate: string | null;
  joiningDate: string | null;
  offerCompensation: string | null;
  offerPdfOriginalName: string | null;
  offerPublishedBy: string | null;
  createdAt: string;
}

interface AdminUserRow {
  id: number;
  email: string;
  full_name: string;
  role: 'super_admin' | 'hr_manager' | 'recruiter';
  created_at: string;
}

export function AdminDashboardPage() {
  const { adminSession, setAdminSession, showToast } = useStore();

  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    setupRequired: boolean;
    smtpConfigured: boolean;
  }>({ loading: true, setupRequired: false, smtpConfigured: false });

  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'applications' | 'offers' | 'jobs' | 'team'
  >('applications');

  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    shortlistedCount: 0,
    issuedOffers: 0,
    repairRequests: 0,
    ordersCount: 0,
  });
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [teamUsers, setTeamUsers] = useState<AdminUserRow[]>([]);

  // Application filters & detail panel
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [savingApp, setSavingApp] = useState(false);

  // Job editor state
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Retail Operations',
    employmentType: 'Full-Time',
    location: 'Woodbridge, ON (Flagship Store)',
    salaryRange: '',
    description: '',
    requirementsText: '',
  });

  // Offer letter workflow state
  const [offerAppId, setOfferAppId] = useState<number | ''>('');
  const [offerMode, setOfferMode] = useState<'generate' | 'upload'>('generate');
  const [offerForm, setOfferForm] = useState({
    offerIssueDate: new Date().toISOString().slice(0, 10),
    joiningDate: '',
    compensation: '',
    signatoryName: '',
    signatoryTitle: 'Human Resources & Talent Acquisition',
  });
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerFeedback, setOfferFeedback] = useState('');
  const [issuedOtpInfo, setIssuedOtpInfo] = useState<{
    applicationId: string;
    email: string;
    verificationCode: string;
  } | null>(null);
  const [adminPdfUrl, setAdminPdfUrl] = useState<string | null>(null);

  // Team member creation
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    role: 'hr_manager' as 'super_admin' | 'hr_manager' | 'recruiter',
    password: '',
  });
  const [teamError, setTeamError] = useState('');

  useEffect(() => {
    fetch('/api/admin/auth/status')
      .then((r) => r.json())
      .then((data) => {
        setAuthStatus({
          loading: false,
          setupRequired: Boolean(data.setupRequired),
          smtpConfigured: Boolean(data.smtpConfigured),
        });
      })
      .catch(() => {
        setAuthStatus({ loading: false, setupRequired: false, smtpConfigured: false });
      });
  }, []);

  const authHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${adminSession?.token || ''}`,
    };
  }, [adminSession]);

  const loadDashboardData = useCallback(async () => {
    if (!adminSession) return;
    try {
      const [ovRes, jobsRes, appsRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: authHeaders() }),
        fetch('/api/admin/jobs', { headers: authHeaders() }),
        fetch(
          `/api/admin/applications?status=${encodeURIComponent(
            statusFilter
          )}&position=${encodeURIComponent(positionFilter)}&q=${encodeURIComponent(
            searchQuery
          )}`,
          { headers: authHeaders() }
        ),
      ]);

      if (ovRes.status === 401) {
        setAdminSession(null);
        return;
      }

      const [ovData, jobsData, appsData] = await Promise.all([
        ovRes.json(),
        jobsRes.json(),
        appsRes.json(),
      ]);

      if (ovData.stats) setStats(ovData.stats);
      if (typeof ovData.smtpConfigured === 'boolean') {
        setAuthStatus((prev) => ({
          ...prev,
          smtpConfigured: ovData.smtpConfigured,
        }));
      }
      if (jobsData.jobs) setJobs(jobsData.jobs);
      if (appsData.applications) {
        setApplications(appsData.applications);
        if (appsData.applications.length > 0 && offerAppId === '') {
          setOfferAppId(appsData.applications[0].id);
        }
      }

      if (adminSession.admin.role === 'super_admin') {
        const usersRes = await fetch('/api/admin/users', { headers: authHeaders() });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setTeamUsers(usersData.users || []);
        }
      }
    } catch {
      // ignore transient error
    }
  }, [adminSession, authHeaders, statusFilter, positionFilter, searchQuery, setAdminSession, offerAppId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (adminSession && !offerForm.signatoryName) {
      setOfferForm((prev) => ({
        ...prev,
        signatoryName: adminSession.admin.fullName,
      }));
    }
  }, [adminSession, offerForm.signatoryName]);

  const handleSetupOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const endpoint = authStatus.setupRequired
        ? '/api/admin/auth/setup'
        : '/api/admin/auth/login';
      const payload = authStatus.setupRequired
        ? authForm
        : { email: authForm.email, password: authForm.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }

      setAdminSession({ token: data.token, admin: data.admin });
      setAuthStatus((prev) => ({ ...prev, setupRequired: false }));
      setAuthForm({ fullName: '', email: '', password: '' });
      showToast(`Signed in as ${data.admin.fullName}`);
    } catch {
      setAuthError('Network error during authentication.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const canManageJobsAndOffers =
    adminSession?.admin.role === 'super_admin' ||
    adminSession?.admin.role === 'hr_manager';

  // Application actions
  const selectApplication = (app: AdminApplication) => {
    setSelectedApp(app);
    setStatusDraft(app.status);
    setNotesDraft(app.internalNotes || '');
  };

  const handleSaveApplicationUpdate = async () => {
    if (!selectedApp) return;
    setSavingApp(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: statusDraft, internalNotes: notesDraft }),
      });
      if (!res.ok) throw new Error();
      showToast('Candidate application updated');
      await loadDashboardData();
      setSelectedApp((prev) =>
        prev ? { ...prev, status: statusDraft, internalNotes: notesDraft } : null
      );
    } catch {
      showToast('Unable to update application');
    } finally {
      setSavingApp(false);
    }
  };

  const handleDownloadResume = async (app: AdminApplication) => {
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/resume`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        showToast('Could not download resume');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = app.resumeOriginalName || `Resume_${app.applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      showToast('Error downloading resume');
    }
  };

  // Job actions
  const openCreateJob = () => {
    setEditingJobId(null);
    setJobForm({
      title: '',
      department: 'Retail Operations',
      employmentType: 'Full-Time',
      location: 'Woodbridge, ON (Flagship Store)',
      salaryRange: '',
      description: '',
      requirementsText: '',
    });
    setShowJobForm(true);
  };

  const openEditJob = (job: AdminJob) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      location: job.location,
      salaryRange: job.salaryRange,
      description: job.description,
      requirementsText: job.requirements.join('\n'),
    });
    setShowJobForm(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingJobId ? `/api/admin/jobs/${editingJobId}` : '/api/admin/jobs';
    const method = editingJobId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        title: jobForm.title,
        department: jobForm.department,
        employmentType: jobForm.employmentType,
        location: jobForm.location,
        salaryRange: jobForm.salaryRange,
        description: jobForm.description,
        requirements: jobForm.requirementsText,
      }),
    });
    if (res.ok) {
      showToast(editingJobId ? 'Vacancy updated' : 'New vacancy published');
      setShowJobForm(false);
      loadDashboardData();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || 'Could not save vacancy');
    }
  };

  const handleToggleJob = async (jobId: number) => {
    const res = await fetch(`/api/admin/jobs/${jobId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (res.ok) {
      showToast('Vacancy status updated');
      loadDashboardData();
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      showToast('Vacancy deleted');
      loadDashboardData();
    }
  };

  // Offer Letter Actions
  const handlePublishOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAppId) return;
    setOfferSubmitting(true);
    setOfferFeedback('');
    try {
      let res: Response;
      if (offerMode === 'generate') {
        res = await fetch(`/api/admin/applications/${offerAppId}/offer/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(offerForm),
        });
      } else {
        if (!offerFile) {
          setOfferFeedback('Please select a PDF offer letter file to upload.');
          setOfferSubmitting(false);
          return;
        }
        const fd = new FormData();
        fd.append('offerIssueDate', offerForm.offerIssueDate);
        fd.append('joiningDate', offerForm.joiningDate);
        fd.append('compensation', offerForm.compensation);
        fd.append('offerPdf', offerFile);
        res = await fetch(`/api/admin/applications/${offerAppId}/offer/upload`, {
          method: 'POST',
          headers: authHeaders(),
          body: fd,
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setOfferFeedback(data.error || 'Unable to publish offer letter.');
        return;
      }
      setOfferFeedback(
        `Official offer letter published for ${data.applicationId} (${data.fileName}).`
      );
      setOfferFile(null);
      loadDashboardData();
    } catch {
      setOfferFeedback('Network error while publishing offer letter.');
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleRevokeOffer = async (appId: number) => {
    const res = await fetch(`/api/admin/applications/${appId}/offer/revoke`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (res.ok) {
      showToast('Offer letter revoked');
      loadDashboardData();
    }
  };

  const handlePreviewOfferPdf = async (appId: number) => {
    const res = await fetch(`/api/admin/applications/${appId}/offer/pdf`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      showToast('No offer PDF available to preview');
      return;
    }
    const blob = await res.blob();
    if (adminPdfUrl) URL.revokeObjectURL(adminPdfUrl);
    setAdminPdfUrl(URL.createObjectURL(blob));
  };

  const handleIssueVerificationCode = async (appId: number) => {
    const res = await fetch(
      `/api/admin/applications/${appId}/issue-verification-code`,
      {
        method: 'POST',
        headers: authHeaders(),
      }
    );
    const data = await res.json();
    if (res.ok) {
      setIssuedOtpInfo({
        applicationId: data.applicationId,
        email: data.email,
        verificationCode: data.verificationCode,
      });
    } else {
      showToast(data.error || 'Could not issue code');
    }
  };

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(newAdminForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setTeamError(data.error || 'Could not add team member.');
      return;
    }
    showToast(`Added ${data.fullName} (${data.role})`);
    setNewAdminForm({ fullName: '', email: '', role: 'hr_manager', password: '' });
    loadDashboardData();
  };

  // =========================================================================
  // AUTH GATE (First-Run Setup OR Sign In)
  // =========================================================================
  if (!adminSession) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20">
        <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10">
          <div className="flex items-center gap-2.5 text-[#B89352] mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Authorized Personnel Only
            </span>
          </div>

          <h1 className="font-serif text-3xl font-semibold text-[#0B172A] mb-2">
            {authStatus.setupRequired
              ? 'Initialize HR Administrator Account'
              : 'Luggage City Admin Sign In'}
          </h1>

          <p className="text-sm text-[#5B6472] mb-6 leading-relaxed">
            {authStatus.setupRequired
              ? 'No administrator account is configured yet. Create the primary Super Admin account below to manage job openings, candidate applications, and official offer letters.'
              : 'Sign in with your authorized Luggage City HR or Recruitment Administrator credentials.'}
          </p>

          {authError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
              {authError}
            </div>
          )}

          {authStatus.loading ? (
            <div className="py-8 text-center text-sm text-[#64748B]">
              Checking administrator authentication status...
            </div>
          ) : (
            <form onSubmit={handleSetupOrLogin} className="space-y-4">
              {authStatus.setupRequired && (
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.fullName}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, fullName: e.target.value })
                    }
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Administrator Email *
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                  placeholder="hr.admin@luggagecity.ca"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Password {authStatus.setupRequired ? '(Min 8 characters) *' : '*'}
                </label>
                <input
                  type="password"
                  required
                  minLength={authStatus.setupRequired ? 8 : 1}
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 px-6 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors cursor-pointer disabled:opacity-60"
              >
                {authSubmitting
                  ? 'Authenticating...'
                  : authStatus.setupRequired
                  ? 'Create Super Admin & Continue'
                  : 'Sign In to Admin Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  const uniquePositions = Array.from(
    new Set(applications.map((a) => a.positionTitle))
  );

  return (
    <div>
      {/* Admin Top Header */}
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4B882] mb-1">
              Luggage City HR & Recruitment Control Centre
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold">
              Administrator Dashboard
            </h1>
            <p className="text-xs text-[#CBD5E1] mt-1">
              Signed in as {adminSession.admin.fullName} ({adminSession.admin.email}) · Role:{' '}
              <span className="font-mono text-[#D4B882]">{adminSession.admin.role}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#CBD5E1] border border-white/15 px-3 py-1.5 rounded-sm">
              SMTP Email: {authStatus.smtpConfigured ? 'Configured' : 'Not Configured'}
            </span>
            <button
              type="button"
              onClick={() => setAdminSession(null)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-6 py-10 space-y-8">
        {/* Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 tabular-nums">
          <div className="p-6 bg-white border border-[#E5DDD0] rounded-sm">
            <div className="text-xs text-[#64748B] mb-1">Active Job Vacancies</div>
            <div className="font-serif text-3xl font-semibold text-[#0B172A]">
              {stats.activeJobs}{' '}
              <span className="text-xs font-sans font-normal text-[#64748B]">
                / {stats.totalJobs} total
              </span>
            </div>
          </div>
          <div className="p-6 bg-white border border-[#E5DDD0] rounded-sm">
            <div className="text-xs text-[#64748B] mb-1">Candidate Applications</div>
            <div className="font-serif text-3xl font-semibold text-[#0B172A]">
              {stats.totalApplications}
            </div>
          </div>
          <div className="p-6 bg-white border border-[#E5DDD0] rounded-sm">
            <div className="text-xs text-[#64748B] mb-1">Shortlisted & Selected</div>
            <div className="font-serif text-3xl font-semibold text-[#0B172A]">
              {stats.shortlistedCount}
            </div>
          </div>
          <div className="p-6 bg-white border border-[#E5DDD0] rounded-sm">
            <div className="text-xs text-[#64748B] mb-1">Official Offer Letters Issued</div>
            <div className="font-serif text-3xl font-semibold text-[#1E5631]">
              {stats.issuedOffers}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DDD0] pb-3">
          {[
            { id: 'applications', label: 'Application Management', icon: FileText },
            { id: 'offers', label: 'Offer Letter Management', icon: FileCheck2 },
            { id: 'jobs', label: 'Job Management', icon: Briefcase },
            ...(adminSession.admin.role === 'super_admin'
              ? [{ id: 'team', label: 'Admin Team & RBAC', icon: Users }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B172A] text-[#FAF9F6]'
                  : 'bg-white text-[#334155] border border-[#E5DDD0] hover:border-[#0B172A]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: APPLICATION MANAGEMENT */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white border border-[#E5DDD0] p-4 rounded-sm">
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                >
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                >
                  <option value="all">All Positions</option>
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, or Application ID..."
                className="px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm w-full md:w-72"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-sm overflow-x-auto">
                {applications.length === 0 ? (
                  <div className="p-10 text-center text-sm text-[#5B6472]">
                    No applications submitted yet. Candidates who apply on the Careers page will appear here immediately.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F1ECE4] text-[#0B172A] border-b border-[#E5DDD0]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Application ID</th>
                        <th className="px-4 py-3 font-semibold">Candidate</th>
                        <th className="px-4 py-3 font-semibold">Position</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEAE1]">
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className={`hover:bg-[#FAF9F6] ${
                            selectedApp?.id === app.id ? 'bg-[#F5F0E7]' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-medium text-[#0B172A]">
                            {app.applicationId}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[#0B172A]">{app.fullName}</div>
                            <div className="text-[11px] text-[#64748B]">{app.email}</div>
                          </td>
                          <td className="px-4 py-3 text-[#334155]">{app.positionTitle}</td>
                          <td className="px-4 py-3 font-medium text-[#0B172A]">{app.status}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => selectApplication(app)}
                              className="px-3 py-1.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Candidate Inspector */}
              <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-sm p-6">
                {!selectedApp ? (
                  <p className="text-sm text-[#5B6472] py-8 text-center">
                    Select an applicant from the table to inspect details, download their resume, update status, or save internal notes.
                  </p>
                ) : (
                  <div className="space-y-5">
                    <div className="pb-4 border-b border-[#EFEAE1]">
                      <div className="font-mono text-xs text-[#B89352] font-semibold">
                        {selectedApp.applicationId}
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-[#0B172A]">
                        {selectedApp.fullName}
                      </h3>
                      <div className="text-xs text-[#5B6472] mt-1">
                        {selectedApp.positionTitle} · {selectedApp.department} · {selectedApp.location}
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-[#334155]">
                      <div>
                        <strong>Email:</strong> {selectedApp.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedApp.phone}
                      </div>
                      <div>
                        <strong>Applied:</strong> {selectedApp.createdAt}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#0B172A] mb-1">
                        Cover Letter
                      </div>
                      <p className="text-xs text-[#475569] bg-[#FAF9F6] border border-[#E5DDD0] p-3 rounded-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {selectedApp.coverLetter}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadResume(selectedApp)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold border border-[#0B172A] text-[#0B172A] rounded-sm hover:bg-[#0B172A] hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Resume ({selectedApp.resumeOriginalName})</span>
                    </button>

                    <div className="space-y-3 pt-4 border-t border-[#EFEAE1]">
                      <div>
                        <label className="block text-xs font-semibold text-[#0B172A] mb-1">
                          Application Status
                        </label>
                        <select
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0B172A] mb-1">
                          Internal HR Notes (Private — Never Shown to Candidate)
                        </label>
                        <textarea
                          rows={3}
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={savingApp}
                          onClick={handleSaveApplicationUpdate}
                          className="flex-1 py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] cursor-pointer"
                        >
                          {savingApp ? 'Saving...' : 'Save Status & Notes'}
                        </button>
                        {canManageJobsAndOffers && (
                          <button
                            type="button"
                            onClick={() => {
                              setOfferAppId(selectedApp.id);
                              setActiveTab('offers');
                            }}
                            className="px-4 py-2.5 text-xs font-semibold bg-[#B89352] text-[#0B172A] rounded-sm hover:bg-[#D4B882] cursor-pointer"
                          >
                            Manage Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFER LETTER MANAGEMENT */}
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white border border-[#E5DDD0] rounded-sm p-7 space-y-5">
              <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
                Issue or Update Official Offer Letter
              </h2>

              {!canManageJobsAndOffers ? (
                <p className="text-sm text-[#5B6472]">
                  Only Super Admin and HR Manager roles are authorized to generate, upload, or revoke employment offer letters.
                </p>
              ) : applications.length === 0 ? (
                <p className="text-sm text-[#5B6472]">
                  No candidate applications exist yet. Once a candidate submits an application on the Careers page, you can select them here to generate or upload their official offer letter PDF.
                </p>
              ) : (
                <form onSubmit={handlePublishOffer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                      Select Candidate *
                    </label>
                    <select
                      required
                      value={offerAppId}
                      onChange={(e) => setOfferAppId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    >
                      {applications.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.applicationId} — {a.fullName} ({a.positionTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 p-1 bg-[#F1ECE4] rounded-sm">
                    <button
                      type="button"
                      onClick={() => setOfferMode('generate')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-sm cursor-pointer ${
                        offerMode === 'generate'
                          ? 'bg-[#0B172A] text-[#FAF9F6]'
                          : 'text-[#334155]'
                      }`}
                    >
                      Generate Official PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferMode('upload')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-sm cursor-pointer ${
                        offerMode === 'upload'
                          ? 'bg-[#0B172A] text-[#FAF9F6]'
                          : 'text-[#334155]'
                      }`}
                    >
                      Upload Official PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                        Offer Issue Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={offerForm.offerIssueDate}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, offerIssueDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                        Joining Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={offerForm.joiningDate}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, joiningDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                      Compensation Details (Optional)
                    </label>
                    <input
                      type="text"
                      value={offerForm.compensation}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, compensation: e.target.value })
                      }
                      placeholder="e.g., $64,000 CAD / annum + benefits"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>

                  {offerMode === 'generate' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                          Authorized Signatory Name
                        </label>
                        <input
                          type="text"
                          value={offerForm.signatoryName}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, signatoryName: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                          Signatory Title
                        </label>
                        <input
                          type="text"
                          value={offerForm.signatoryTitle}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, signatoryTitle: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                        Upload Official PDF (Max 10 MB) *
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-dashed border-[#B89352] bg-[#FAF9F6] rounded-sm cursor-pointer">
                        <Upload className="w-5 h-5 text-[#B89352]" />
                        <span className="text-xs font-medium text-[#0B172A]">
                          {offerFile ? offerFile.name : 'Choose official .pdf offer letter'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  )}

                  {offerFeedback && (
                    <div className="p-3.5 bg-[#FAF9F6] border border-[#B89352] text-xs text-[#0B172A] rounded-sm">
                      {offerFeedback}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={offerSubmitting}
                    className="w-full py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] cursor-pointer disabled:opacity-60"
                  >
                    {offerSubmitting
                      ? 'Publishing to Candidate Portal...'
                      : 'Publish Official Offer Letter'}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Published Offer Tracking & Authorized OTP Dispatch Helper */}
            <div className="lg:col-span-6 space-y-6">
              {issuedOtpInfo && (
                <div className="p-5 bg-[#0B172A] text-[#FAF9F6] rounded-sm border border-[#B89352] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#D4B882]">
                      Authorized 10-Minute Candidate Verification Code
                    </span>
                    <button
                      type="button"
                      onClick={() => setIssuedOtpInfo(null)}
                      className="text-white/60 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-[#CBD5E1]">
                    Application {issuedOtpInfo.applicationId} · {issuedOtpInfo.email}
                  </div>
                  <div className="font-mono text-3xl tracking-[0.25em] font-semibold text-[#D4B882]">
                    {issuedOtpInfo.verificationCode}
                  </div>
                  <p className="text-[11px] text-[#CBD5E1]">
                    Share securely with the verified candidate for use on /check-offer-letter while SMTP email dispatch is pending configuration.
                  </p>
                </div>
              )}

              <div className="bg-white border border-[#E5DDD0] rounded-sm p-6">
                <h3 className="font-serif text-2xl font-semibold text-[#0B172A] mb-4">
                  Candidate Offer Letter Registry
                </h3>
                {applications.length === 0 ? (
                  <p className="text-sm text-[#5B6472]">No candidate records yet.</p>
                ) : (
                  <div className="divide-y divide-[#EFEAE1]">
                    {applications.map((app) => (
                      <div key={app.id} className="py-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#0B172A]">
                              {app.fullName}{' '}
                              <span className="font-mono text-xs text-[#64748B]">
                                ({app.applicationId})
                              </span>
                            </div>
                            <div className="text-xs text-[#5B6472]">
                              {app.positionTitle} · Offer Status:{' '}
                              <strong
                                className={
                                  app.offerStatus === 'issued'
                                    ? 'text-[#1E5631]'
                                    : app.offerStatus === 'revoked'
                                    ? 'text-[#9B2C2C]'
                                    : 'text-[#64748B]'
                                }
                              >
                                {app.offerStatus === 'issued'
                                  ? `Issued (${app.offerIssueDate})`
                                  : app.offerStatus === 'revoked'
                                  ? 'Revoked'
                                  : 'Not Issued'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {app.offerStatus === 'issued' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePreviewOfferPdf(app.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#0B172A] text-[#0B172A] rounded-sm hover:bg-[#0B172A] hover:text-white cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview PDF</span>
                              </button>
                              {canManageJobsAndOffers && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeOffer(app.id)}
                                  className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-700 rounded-sm hover:bg-red-50 cursor-pointer"
                                >
                                  Revoke Offer
                                </button>
                              )}
                            </>
                          )}
                          {canManageJobsAndOffers && (
                            <button
                              type="button"
                              onClick={() => handleIssueVerificationCode(app.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#F1ECE4] text-[#0B172A] border border-[#D4CDC0] rounded-sm hover:border-[#0B172A] cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-[#B89352]" />
                              <span>Generate Portal Code</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOB MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
                Manage Job Vacancies
              </h2>
              {canManageJobsAndOffers && (
                <button
                  type="button"
                  onClick={openCreateJob}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Vacancy</span>
                </button>
              )}
            </div>

            {showJobForm && (
              <form
                onSubmit={handleSaveJob}
                className="bg-white border border-[#B89352] rounded-sm p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold text-[#0B172A]">
                    {editingJobId ? 'Edit Job Vacancy' : 'Create New Job Vacancy'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="p-1 text-[#64748B] hover:text-[#0B172A] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={jobForm.department}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, department: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Employment Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.employmentType}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, employmentType: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, location: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Compensation Range (Optional)
                    </label>
                    <input
                      type="text"
                      value={jobForm.salaryRange}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, salaryRange: e.target.value })
                      }
                      placeholder="e.g., $55,000 – $65,000 CAD / yr"
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Requirements (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={jobForm.requirementsText}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, requirementsText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm cursor-pointer"
                  >
                    {editingJobId ? 'Save Changes' : 'Publish Vacancy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-5 py-2.5 text-xs border border-[#D4CDC0] rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-[#E5DDD0] rounded-sm divide-y divide-[#EFEAE1]">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-semibold text-[#B89352]">
                        {job.department}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{job.employmentType}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          job.isActive
                            ? 'text-[#1E5631] font-semibold'
                            : 'text-[#9B2C2C] font-semibold'
                        }
                      >
                        {job.isActive ? 'Active on Careers' : 'Inactive / Hidden'}
                      </span>
                    </div>
                    <div className="font-serif text-xl font-semibold text-[#0B172A] mt-0.5">
                      {job.title}
                    </div>
                    <div className="text-xs text-[#5B6472]">{job.location}</div>
                  </div>

                  {canManageJobsAndOffers && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleJob(job.id)}
                        className="px-3.5 py-2 text-xs font-medium border border-[#D4CDC0] rounded-sm hover:border-[#0B172A] cursor-pointer"
                      >
                        {job.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditJob(job)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium border border-[#D4CDC0] rounded-sm hover:border-[#0B172A] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium border border-red-200 text-red-700 rounded-sm hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN TEAM RBAC (Super Admin Only) */}
        {activeTab === 'team' && adminSession.admin.role === 'super_admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateAdminUser}
              className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-sm p-6 space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
                Add Authorized Admin User
              </h2>
              {teamError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
                  {teamError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.fullName}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Role *</label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) =>
                    setNewAdminForm({
                      ...newAdminForm,
                      role: e.target.value as 'super_admin' | 'hr_manager' | 'recruiter',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                >
                  <option value="hr_manager">HR Manager (Jobs, Applications & Offers)</option>
                  <option value="recruiter">Recruiter (Review Applications & Notes Only)</option>
                  <option value="super_admin">Super Admin (Full Control & Team RBAC)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Initial Password (Min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newAdminForm.password}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm cursor-pointer"
              >
                Create Admin Account
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-sm p-6">
              <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-4">
                Authorized Team Directory
              </h2>
              <div className="divide-y divide-[#EFEAE1]">
                {teamUsers.map((u) => (
                  <div
                    key={u.id}
                    className="py-3.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-[#0B172A]">{u.full_name}</div>
                      <div className="text-xs text-[#64748B]">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5631]" />
                      <span className="font-mono text-[#0B172A]">{u.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin PDF Preview Modal */}
      {adminPdfUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#0B172A]/75 flex items-center justify-center p-4"
          onClick={() => setAdminPdfUrl(null)}
        >
          <div
            className="w-full max-w-4xl h-[85vh] bg-white rounded-sm overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-[#0B172A] text-white">
              <span className="text-sm font-semibold">Offer Letter PDF Preview</span>
              <button
                type="button"
                onClick={() => setAdminPdfUrl(null)}
                className="p-1 hover:bg-white/10 rounded-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe src={adminPdfUrl} title="Admin Offer PDF Preview" className="flex-1 w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
