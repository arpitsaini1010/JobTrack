import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Button, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PortalBadge } from '../components/StatusBadge';
import {
  Search,
  MapPin,
  Flame,
  Bookmark,
  ExternalLink,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  CheckCircle2,
  Globe,
  Radio
} from 'lucide-react';

const JobSearch = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  // Search & Filters
  const [searchTitle, setSearchTitle] = useState(searchParams.get('search') || user?.primaryTargetTitle || '');
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [filterPortal, setFilterPortal] = useState('All');
  const [filterRemote, setFilterRemote] = useState('All');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      const jobList = res.data.jobs || [];
      setJobs(jobList);

      if (jobList.length > 0) {
        const queryCompany = searchParams.get('company');
        const querySearch = searchParams.get('search');
        let matched = null;

        if (queryCompany) {
          matched = jobList.find(
            (j) => j.company.toLowerCase().includes(queryCompany.toLowerCase())
          );
        } else if (querySearch) {
          matched = jobList.find(
            (j) =>
              j.role.toLowerCase().includes(querySearch.toLowerCase()) ||
              j.company.toLowerCase().includes(querySearch.toLowerCase())
          );
        }

        setSelectedJob(matched || jobList[0]);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Trigger Live Feed Sync from ArbeitNow, Remotive, Jobicy and premier portals
  const handleSyncFeeds = async () => {
    try {
      setSyncing(true);
      setFeedback({ show: false, message: '', type: 'success' });
      const res = await api.post('/jobs/sync');
      await fetchJobs();
      setFeedback({
        show: true,
        type: 'success',
        message: `✓ Refreshed! Synced ${res.data?.result?.totalCount || 'active'} real-time live company openings.`
      });
    } catch (err) {
      console.error('Sync failed:', err);
      setFeedback({
        show: true,
        type: 'danger',
        message: 'Could not refresh live jobs. Please check network connection.'
      });
    } finally {
      setSyncing(false);
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchTitle.trim()) {
        const t = searchTitle.toLowerCase().trim();
        const roleMatches = job.role?.toLowerCase().includes(t);
        const compMatches = job.company?.toLowerCase().includes(t);
        const skillMatches = job.skills?.some((s) => s.toLowerCase().includes(t));
        if (!roleMatches && !compMatches && !skillMatches) return false;
      }

      if (searchLocation.trim()) {
        const loc = searchLocation.toLowerCase().trim();
        if (!job.location?.toLowerCase().includes(loc)) return false;
      }

      if (filterPortal !== 'All' && job.portal !== filterPortal) return false;

      if (filterRemote === 'Remote' && !job.location?.toLowerCase().includes('remote')) {
        return false;
      }

      return true;
    });
  }, [jobs, searchTitle, searchLocation, filterPortal, filterRemote]);

  useEffect(() => {
    if (filteredJobs.length > 0) {
      if (!selectedJob || !filteredJobs.some((j) => j._id === selectedJob._id)) {
        setSelectedJob(filteredJobs[0]);
      }
    } else {
      setSelectedJob(null);
    }
  }, [filteredJobs]);

  // Apply & Track (Opens live application URL in new tab & records to tracker)
  const handleApply = async (job) => {
    try {
      setActionLoading(true);

      // Open genuine live job application page immediately
      if (job.jobUrl) {
        window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
      }

      await api.post('/jobs/apply-and-track', {
        jobId: job._id,
        targetStatus: 'Applied'
      });

      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isApplied: true, userApplicationStatus: 'Applied' } : j))
      );
      if (selectedJob && selectedJob._id === job._id) {
        setSelectedJob({ ...selectedJob, isApplied: true, userApplicationStatus: 'Applied' });
      }

      setFeedback({
        show: true,
        type: 'success',
        message: `🚀 Opened official opening page for ${job.company}! Saved to your Job Tracker under 'Applied' and added to Companies Tracker.`
      });
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Direct Page Open (Opens live URL without updating status)
  const handleOpenDirectPage = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 1-Click Save / Bookmark
  const handleBookmark = async (job) => {
    try {
      setActionLoading(true);
      await api.post('/jobs/apply-and-track', {
        jobId: job._id,
        targetStatus: 'Bookmarked'
      });

      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isApplied: true, userApplicationStatus: 'Bookmarked' } : j))
      );
      if (selectedJob && selectedJob._id === job._id) {
        setSelectedJob({ ...selectedJob, isApplied: true, userApplicationStatus: 'Bookmarked' });
      }

      setFeedback({
        show: true,
        type: 'success',
        message: `🔖 Saved! Added to your Bookmarked tracker.`
      });
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-4" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)' }}>
      <Container fluid="xl">
        {/* Search & Filter Header Bar */}
        <div className="bg-white p-3 p-md-4 rounded-3 border shadow-sm mb-3">
          <Row className="g-2 align-items-center">
            {/* Title search */}
            <Col md={4}>
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute text-muted"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-control ps-5 py-2 rounded-2"
                  placeholder="Job title, role, skill (e.g. React, Engineer)..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  style={{ fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                />
              </div>
            </Col>

            {/* Location search */}
            <Col md={3}>
              <div className="position-relative">
                <MapPin
                  size={16}
                  className="position-absolute text-muted"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-control ps-5 py-2 rounded-2"
                  placeholder="City in India or Remote (e.g. Bangalore, Pune)..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{ fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                />
              </div>
            </Col>

            {/* Portal selector */}
            <Col md={2}>
              <select
                className="form-select py-2 rounded-2"
                style={{ fontSize: '0.88rem', borderColor: '#e2e8f0' }}
                value={filterPortal}
                onChange={(e) => setFilterPortal(e.target.value)}
              >
                <option value="All">All Sources</option>
                <option value="LinkedIn">LinkedIn India</option>
                <option value="Direct">Official Career Site</option>
                <option value="Remotive">Remote (India)</option>
              </select>
            </Col>

            {/* Sync Live Jobs Button */}
            <Col md={3} className="d-flex align-items-center gap-2">
              <Button
                variant="teal"
                size="sm"
                className="w-100 py-2 rounded-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                onClick={handleSyncFeeds}
                disabled={syncing}
                title="Fetch latest live openings from employer career boards"
              >
                <RefreshCw size={14} className={syncing ? 'spinner-border spinner-border-sm text-white' : ''} />
                <span>{syncing ? 'Fetching Live...' : 'Fetch Live Jobs'}</span>
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                className="py-2 px-3 rounded-2 fw-medium"
                onClick={() => {
                  setSearchTitle('');
                  setSearchLocation('');
                  setFilterPortal('All');
                  setFilterRemote('All');
                }}
                title="Clear Filters"
              >
                Reset
              </Button>
            </Col>
          </Row>

          {/* Quick India City Badges */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-2 border-top">
            <span className="text-muted small fw-semibold">🇮🇳 Region India:</span>
            {['All India', 'Bangalore', 'Hyderabad', 'Pune', 'Gurugram', 'Mumbai', 'Noida', 'Remote'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSearchLocation(city === 'All India' ? '' : city)}
                className={`btn btn-sm rounded-pill px-3 py-0.5 fw-semibold ${
                  (city === 'All India' && !searchLocation) || searchLocation.toLowerCase() === city.toLowerCase()
                    ? 'btn-teal'
                    : 'btn-light border'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                {city === 'All India' ? '🇮🇳 All India' : city}
              </button>
            ))}

            <div className="ms-auto d-flex align-items-center gap-1.5">
              {['LinkedIn', 'Direct'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPortal(filterPortal === p ? 'All' : p)}
                  className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold ${
                    filterPortal === p ? 'btn-teal' : 'btn-light border'
                  }`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {p === 'Direct' ? 'Direct Careers' : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {feedback.show && (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback({ ...feedback, show: false })}
            className="d-flex align-items-center gap-2 py-2 mb-3 shadow-sm border"
            style={{ fontSize: '0.88rem' }}
          >
            <CheckCircle2 size={16} />
            <span>{feedback.message}</span>
          </Alert>
        )}

        {/* Split-Screen Search Workspace */}
        <div className="split-search-container">
          {/* Left Panel: Job Cards List */}
          <div className="split-search-list">
            <div className="p-3 border-bottom bg-light bg-opacity-50 d-flex align-items-center justify-content-between">
              <span className="fw-bold text-dark small d-inline-flex align-items-center gap-1.5">
                <span className="badge rounded-circle bg-success p-1" style={{ width: '8px', height: '8px' }} />
                <span>{filteredJobs.length} Live Openings in India</span>
              </span>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Select to inspect & apply
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: '#004d40' }} size="sm" />
                <p className="mt-2 text-muted small">Loading live company openings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-5 px-3 text-muted">
                <Search size={32} className="opacity-40 mb-2" />
                <h6>No jobs match your search</h6>
                <p className="small mb-3">Try resetting your keyword or location, or fetch live jobs.</p>
                <Button variant="teal" size="sm" onClick={handleSyncFeeds} disabled={syncing}>
                  Fetch Live Openings
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob && selectedJob._id === job._id;
                return (
                  <div
                    key={job._id}
                    className={`job-search-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <PortalBadge portal={job.portal} size="sm" />
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {job.postedDate
                            ? new Date(job.postedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                            : 'Live'}
                        </span>
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted p-1 hover-teal"
                            title="Open live posting directly"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.94rem' }}>
                      {job.role}
                    </h6>
                    <div className="text-secondary small fw-medium mb-2">
                      {job.company} &bull; {job.location}
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                      {job.salary && (
                        <span className="badge bg-light text-dark border small fw-medium">
                          {job.salary}
                        </span>
                      )}
                      {job.isApplied && (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                          ✓ {job.userApplicationStatus || 'Tracked'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel: Job Detail View */}
          <div className="split-search-detail">
            {selectedJob ? (
              <div>
                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 pb-3 border-bottom mb-4">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 small d-inline-flex align-items-center gap-1">
                        <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }} />
                        Verified Live Opening
                      </span>
                      <PortalBadge portal={selectedJob.portal} size="sm" />
                    </div>

                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {selectedJob.role}
                    </h3>
                    <div className="d-flex align-items-center gap-2 text-secondary mb-2">
                      <span className="fw-bold text-dark">{selectedJob.company}</span>
                      <span>&bull;</span>
                      <span>{selectedJob.location}</span>
                    </div>
                  </div>

                  {/* Actions: Apply & Track + Direct Page Link */}
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <Button
                      variant="teal"
                      className="px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleApply(selectedJob)}
                      disabled={actionLoading}
                      title="Open application page and track under Applied"
                    >
                      <span>Apply & Track</span>
                      <ExternalLink size={15} />
                    </Button>

                    <Button
                      variant="outline-teal"
                      className="px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
                      onClick={() => handleOpenDirectPage(selectedJob.jobUrl)}
                      title="Open application page directly in a new tab"
                    >
                      <Globe size={15} />
                      <span>Open Page</span>
                    </Button>

                    <Button
                      variant="light"
                      className="border px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5 text-secondary"
                      onClick={() => handleBookmark(selectedJob)}
                      disabled={actionLoading}
                      title="Save to tracker without applying yet"
                    >
                      <Bookmark size={15} />
                      <span>Bookmark</span>
                    </Button>
                  </div>
                </div>

                {/* Direct Live Application Link Box */}
                {selectedJob.jobUrl && (
                  <div className="p-3 mb-4 rounded-3 border bg-white shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <span className="text-muted small d-block mb-1 fw-medium">
                        🔗 Direct Live Job Application Link:
                      </span>
                      <a
                        href={selectedJob.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fw-bold text-teal text-break text-decoration-none"
                        style={{ color: '#004d40', fontSize: '0.88rem' }}
                      >
                        {selectedJob.jobUrl}
                      </a>
                    </div>
                    <Button
                      variant="teal"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 px-3 py-1.5 fw-semibold"
                      onClick={() => handleOpenDirectPage(selectedJob.jobUrl)}
                    >
                      <span>Go to Application</span>
                      <ExternalLink size={13} />
                    </Button>
                  </div>
                )}

                {/* Main Details Grid */}
                <Row className="g-4">
                  {/* Left Column: Description & Similar Companies */}
                  <Col lg={8}>
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">
                        About The Role
                      </h6>
                      <p className="text-secondary small" style={{ lineHeight: '1.65', fontSize: '0.9rem' }}>
                        {selectedJob.description ||
                          `Exciting engineering opportunity with ${selectedJob.company}. Build scalable web architectures, APIs, and modern user experiences.`}
                      </p>
                    </div>

                    {/* Similar Companies Hiring */}
                    <div className="p-3 rounded-3 bg-light border mt-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <Building2 size={16} className="text-success" />
                          <h6 className="fw-bold text-dark mb-0 fs-6">
                            Similar Companies in {selectedJob.industry || 'Technology'}
                          </h6>
                        </div>
                        <Link to="/trackers/companies" className="text-teal small fw-semibold text-decoration-none" style={{ color: '#004d40' }}>
                          Company Tracker &rarr;
                        </Link>
                      </div>

                      <p className="text-muted small mb-3">
                        Looking for similar companies to <strong>{selectedJob.company}</strong>? Click any peer company to explore their openings:
                      </p>

                      <div className="d-flex flex-wrap gap-2">
                        {selectedJob.similarCompanies && selectedJob.similarCompanies.length > 0 ? (
                          selectedJob.similarCompanies.map((simComp) => (
                            <button
                              key={simComp}
                              type="button"
                              onClick={() => {
                                setSearchTitle(simComp);
                                setSearchLocation('');
                              }}
                              className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{ fontSize: '0.82rem' }}
                            >
                              <Building2 size={13} className="text-muted" />
                              <span className="fw-semibold text-dark">{simComp}</span>
                              <ArrowRight size={12} className="text-success" />
                            </button>
                          ))
                        ) : (
                          ['Google', 'Microsoft', 'Swiggy', 'Razorpay', 'Zomato'].map((simComp) => (
                            <button
                              key={simComp}
                              type="button"
                              onClick={() => {
                                setSearchTitle(simComp);
                                setSearchLocation('');
                              }}
                              className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{ fontSize: '0.82rem' }}
                            >
                              <Building2 size={13} className="text-muted" />
                              <span className="fw-semibold text-dark">{simComp}</span>
                              <ArrowRight size={12} className="text-success" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Offer & Skills */}
                  <Col lg={4}>
                    <div className="p-3 border rounded-3 bg-light mb-3">
                      <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider">
                        Job Snapshot
                      </h6>
                      <div className="d-flex flex-column gap-2 small">
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Package / CTC</div>
                          <div className="fw-bold text-success">{selectedJob.salary || 'Competitive'}</div>
                        </div>
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Experience</div>
                          <div className="fw-semibold text-dark">{selectedJob.experience || '0-2 Years'}</div>
                        </div>
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Job Type</div>
                          <div className="fw-semibold text-dark">{selectedJob.type || 'Full-time'}</div>
                        </div>
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Portal Source</div>
                          <div className="fw-semibold text-dark">{selectedJob.portal || 'Direct'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-3 bg-white">
                      <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">
                        Required Skills
                      </h6>
                      <div className="d-flex flex-wrap gap-1.5">
                        {selectedJob.skills && selectedJob.skills.length > 0 ? (
                          selectedJob.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="badge bg-light text-secondary border px-2 py-1"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">General Software Engineering</span>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <Briefcase size={40} className="opacity-40 mb-2" />
                <p>Select a job from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default JobSearch;
