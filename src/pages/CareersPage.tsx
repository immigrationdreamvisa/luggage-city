import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Copy,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  MapPin,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { IMAGES } from '../data/catalog';
import { SafeImage } from '../components/SafeImage';

interface JobListing {
  id: number;
  slug: string;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange: string;
}

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Career Growth',
    desc: 'Clear progression paths from Showroom Specialist to Store Leadership, Buying, E-commerce, and Corporate Operations.',
  },
  {
    icon: HeartHandshake,
    title: 'Supportive Team',
    desc: 'Work alongside seasoned luggage specialists, repair craftsmen, and retail leaders who invest in shared success.',
  },
  {
    icon: BookOpen,
    title: 'Learning Opportunities',
    desc: 'Direct brand certification workshops with Samsonite, Briggs & Riley, Pacsafe, and Secrid product trainers.',
  },
  {
    icon: GraduationCap,
    title: 'Professional Development',
    desc: 'Cross-functional exposure spanning omnichannel retail, inventory planning, digital merchandising, and client service.',
  },
  {
    icon: Award,
    title: 'Employee Benefits',
    desc: 'Competitive Canadian compensation, performance incentives, staff product discounts, and health coverage for full-time roles.',
  },
];

export function CareersPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const formRef = useRef<HTMLDivElement | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    positionTitle: '',
    location: 'Woodbridge, ON (Flagship Store)',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    applicationId: string;
    fullName: string;
    email: string;
    positionTitle: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/jobs')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load job vacancies.');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const list = (data.jobs || []) as JobListing[];
        setJobs(list);
        if (list.length > 0 && !form.positionTitle) {
          setSelectedJobId(String(list[0].id));
          setForm((prev) => ({
            ...prev,
            positionTitle: list[0].title,
            location: list[0].location,
          }));
        }
      })
      .catch(() => {
        if (active) setJobsError('Could not load current openings. Please refresh.');
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const departments = useMemo(() => {
    const set = new Set(jobs.map((j) => j.department));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (deptFilter === 'All') return jobs;
    return jobs.filter((j) => j.department === deptFilter);
  }, [jobs, deptFilter]);

  const handleApplyClick = (job: JobListing) => {
    setSelectedJobId(String(job.id));
    setForm((prev) => ({
      ...prev,
      positionTitle: job.title,
      location: job.location,
    }));
    setConfirmation(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePositionSelect = (val: string) => {
    const matched = jobs.find((j) => String(j.id) === val);
    if (matched) {
      setSelectedJobId(String(matched.id));
      setForm((prev) => ({
        ...prev,
        positionTitle: matched.title,
        location: matched.location,
      }));
    } else {
      setSelectedJobId('');
      setForm((prev) => ({ ...prev, positionTitle: val }));
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!resumeFile) {
      setSubmitError('Please upload your resume in PDF, DOC, or DOCX format.');
      return;
    }

    const ext = resumeFile.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setSubmitError('Only PDF, DOC, and DOCX resume files are accepted.');
      return;
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      setSubmitError('Resume file size must be 5 MB or smaller.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      fd.append('positionTitle', form.positionTitle.trim());
      fd.append('location', form.location.trim());
      fd.append('coverLetter', form.coverLetter.trim());
      if (selectedJobId) fd.append('jobId', selectedJobId);
      fd.append('resume', resumeFile);

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Unable to submit application.');
        return;
      }

      setConfirmation({
        applicationId: data.applicationId,
        fullName: data.fullName,
        email: data.email,
        positionTitle: data.positionTitle,
      });
      setForm((prev) => ({
        ...prev,
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
      }));
      setResumeFile(null);
    } catch {
      setSubmitError('A network error occurred while submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyApplicationId = () => {
    if (!confirmation) return;
    navigator.clipboard?.writeText(confirmation.applicationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div>
      {/* 1. Careers Hero */}
      <section className="bg-[#0B172A] text-[#FAF9F6]">
        <div className="max-w-[1360px] mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-3">
              Luggage City Careers · Corporate & Retail Recruitment
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.1] mb-5">
              Build Your Career. Travel Further With Us.
            </h1>
            <p className="text-base text-[#CBD5E1] leading-relaxed mb-8 max-w-xl">
              Join the Luggage City team and become part of a company passionate about travel, quality and exceptional customer experiences.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#open-positions"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B89352] text-[#0B172A] rounded-sm hover:bg-[#D4B882] transition-colors whitespace-nowrap"
              >
                <span>View Open Positions</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/check-offer-letter"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium border border-[#FAF9F6]/35 text-[#FAF9F6] rounded-sm hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <FileCheck2 className="w-4 h-4 text-[#D4B882]" />
                <span>Check Your Offer Letter</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-sm overflow-hidden border border-white/15 aspect-[16/10]">
              <SafeImage
                src={IMAGES.careersHero}
                alt="Luggage City corporate and showroom team collaborating around a sunlit oak table"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Work With Us */}
      <section className="max-w-[1360px] mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
            Why Work With Us
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] mb-3">
            A Workplace Built on Craft, Respect, and Ambition
          </h2>
          <p className="text-sm text-[#5B6472] leading-relaxed">
            As part of the K. Jamson Group, Luggage City blends family-rooted Canadian stability with modern omnichannel retail growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="p-6 bg-white border border-[#E5DDD0] rounded-sm flex flex-col"
            >
              <b.icon className="w-5 h-5 text-[#B89352] mb-4" />
              <h3 className="text-base font-semibold text-[#0B172A] mb-2">{b.title}</h3>
              <p className="text-xs text-[#5B6472] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Life at Luggage City */}
      <section className="bg-[#F1ECE4] border-y border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
              Company Culture
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A]">
              Life at Luggage City
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <figure className="bg-white border border-[#E5DDD0] rounded-sm overflow-hidden">
              <div className="aspect-[4/3]">
                <SafeImage
                  src={IMAGES.careersHero}
                  alt="Collaborative cross-functional retail and digital commerce planning"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <div className="text-sm font-semibold text-[#0B172A] mb-1">
                  Collaborative Corporate Culture
                </div>
                <p className="text-xs text-[#5B6472] leading-relaxed">
                  E-commerce, buying, marketing, and store leaders work side by side at our Woodbridge headquarters.
                </p>
              </figcaption>
            </figure>

            <figure className="bg-white border border-[#E5DDD0] rounded-sm overflow-hidden">
              <div className="aspect-[4/3]">
                <SafeImage
                  src={IMAGES.careersRetail}
                  alt="Consultative luggage specialist assisting a customer in our showroom"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <div className="text-sm font-semibold text-[#0B172A] mb-1">
                  Consultative Retail Excellence
                </div>
                <p className="text-xs text-[#5B6472] leading-relaxed">
                  Our specialists guide travellers across 40+ brands in spacious, modern Ontario showrooms.
                </p>
              </figcaption>
            </figure>

            <figure className="bg-white border border-[#E5DDD0] rounded-sm overflow-hidden">
              <div className="aspect-[4/3]">
                <SafeImage
                  src={IMAGES.repairWorkshop}
                  alt="Certified technician workshop restoring luggage hardware"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <div className="text-sm font-semibold text-[#0B172A] mb-1">
                  Hands-On Craft & Longevity
                </div>
                <p className="text-xs text-[#5B6472] leading-relaxed">
                  Our authorized repair craftsmen uphold sustainability and brand trust every day.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 4. Current Job Openings (Live from Admin-Managed SQLite DB) */}
      <section id="open-positions" className="max-w-[1360px] mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
              Recruitment Board
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] mb-2">
              Current Job Openings
            </h2>
            <p className="text-sm text-[#5B6472] max-w-xl">
              Live vacancies managed directly by Luggage City Human Resources. Select any open role below to apply online.
            </p>
          </div>

          {departments.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-[#F1ECE4] p-1 rounded-sm border border-[#E5DDD0]">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDeptFilter(dept)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                    deptFilter === dept
                      ? 'bg-[#0B172A] text-[#FAF9F6]'
                      : 'text-[#334155] hover:text-[#0B172A]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 bg-white border border-[#E5DDD0] rounded-sm p-7 animate-pulse"
              />
            ))}
          </div>
        ) : jobsError ? (
          <div className="p-6 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
            {jobsError}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 bg-white border border-[#E5DDD0] rounded-sm text-center">
            <Briefcase className="w-8 h-8 text-[#B89352] mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
              No Active Openings in This Department
            </h3>
            <p className="text-sm text-[#5B6472]">
              You can still submit a general application below for future consideration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="bg-white border border-[#E5DDD0] rounded-sm p-7 flex flex-col justify-between hover:border-[#B89352] transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6472] mb-2">
                    <span className="font-semibold text-[#B89352]">{job.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.employmentType}</span>
                    {job.salaryRange && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-medium text-[#0B172A]">
                          {job.salaryRange}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-[#0B172A] mb-1.5">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#5B6472] mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#B89352] shrink-0" />
                    <span>{job.location}</span>
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {job.requirements.length > 0 && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-[#0B172A] mb-2">
                        Key Requirements
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#475569] list-disc pl-4">
                        {job.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EFEAE1] flex items-center justify-between gap-4">
                  <span className="text-xs text-[#64748B]">Accepting Applications</span>
                  <button
                    type="button"
                    onClick={() => handleApplyClick(job)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Job Application Form */}
      <section
        ref={formRef}
        id="apply-form"
        className="bg-white border-t border-[#E5DDD0]"
      >
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
              Online Application
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] mb-2">
              Submit Your Application
            </h2>
            <p className="text-sm text-[#5B6472]">
              Upon submission, you will receive a unique Application ID to track your candidacy and verify official offer letters through our secure portal.
            </p>
          </div>

          {confirmation ? (
            <div className="p-8 bg-[#FAF9F6] border border-[#B89352] rounded-sm space-y-5">
              <div className="flex items-center gap-3 text-[#1E5631]">
                <CheckCircle2 className="w-7 h-7 shrink-0" />
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0B172A]">
                    Application Submitted Successfully
                  </h3>
                  <p className="text-xs text-[#5B6472]">
                    Thank you, {confirmation.fullName}. Your application for{' '}
                    <strong>{confirmation.positionTitle}</strong> has been securely recorded.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E5DDD0] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#5B6472] mb-1">
                    Your Unique Application ID (Save for Offer Verification)
                  </div>
                  <div className="font-mono text-2xl font-semibold text-[#0B172A] tracking-wide">
                    {confirmation.applicationId}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Registered Email: {confirmation.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyApplicationId}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-[#0B172A] text-[#0B172A] rounded-sm hover:bg-[#0B172A] hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/check-offer-letter"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844]"
                >
                  <FileCheck2 className="w-4 h-4 text-[#D4B882]" />
                  <span>Go to Check Your Offer Letter</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="px-5 py-3 text-xs font-medium text-[#0B172A] border border-[#D4CDC0] rounded-sm hover:bg-[#F1ECE4] cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleApplicationSubmit}
              className="bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm p-7 sm:p-9 space-y-5"
            >
              {submitError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Jordan Patel"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jordan.patel@example.ca"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(416) 555-0148"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Position Applying For *
                  </label>
                  {jobs.length > 0 ? (
                    <select
                      required
                      value={selectedJobId || form.positionTitle}
                      onChange={(e) => handlePositionSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                    >
                      {jobs.map((j) => (
                        <option key={j.id} value={String(j.id)}>
                          {j.title} — {j.department}
                        </option>
                      ))}
                      <option value="General Talent Pool">General Talent Pool</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={form.positionTitle}
                      onChange={(e) =>
                        setForm({ ...form, positionTitle: e.target.value })
                      }
                      placeholder="Position Title"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Preferred Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Woodbridge, ON or Thornhill, ON"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Resume Upload (PDF, DOC, or DOCX — Max 5 MB) *
                  </label>
                  <label className="flex items-center justify-between gap-4 px-4 py-4 bg-white border border-dashed border-[#B89352] rounded-sm cursor-pointer hover:bg-[#F9F6F0] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Upload className="w-5 h-5 text-[#B89352] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#0B172A] truncate">
                          {resumeFile ? resumeFile.name : 'Choose your resume file'}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {resumeFile
                            ? `${(resumeFile.size / 1024).toFixed(1)} KB · Ready to upload securely`
                            : 'Accepted formats: .pdf, .doc, .docx (stored privately)'}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 text-xs font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm shrink-0">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.coverLetter}
                    onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                    placeholder="Share your relevant retail, operations, e-commerce, or client care experience and why you would like to join Luggage City..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#64748B]">
                  Your resume and application data are stored privately and reviewed exclusively by authorized Luggage City HR personnel.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
