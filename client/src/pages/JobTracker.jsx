import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Form, Modal, Spinner, Alert, Badge, Row, Col, Card } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Layers,
  Building2,
  Search,
  Plus,
  List,
  LayoutGrid,
  ExternalLink,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'All', label: 'All Applications' },
  { key: 'Bookmarked', label: 'Bookmarked' },
  { key: 'Applying', label: 'Applying' },
  { key: 'Applied', label: 'Applied' },
  { key: 'Interviewing', label: 'Interviewing' },
  { key: 'Negotiating', label: 'Offers' },
  { key: 'Accepted', label: 'Accepted' }
];

const JobTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStage, setActiveStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'board'

  // Quick Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    company: '',
    role: user?.primaryTargetTitle || 'Software Engineer',
    location: 'Remote',
    salary: '',
    status: 'Bookmarked',
    jobUrl: '',
    excitement: 4
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Compute stage counts
  const stageCounts = useMemo(() => {
    const counts = {
      All: applications.length,
      Bookmarked: 0,
      Applying: 0,
      Applied: 0,
      Interviewing: 0,
      Negotiating: 0,
      Accepted: 0
    };

    applications.forEach((app) => {
      if (app.status === 'Interview' || app.status === 'Interviewing') counts.Interviewing++;
      else if (app.status === 'Offer' || app.status === 'Negotiating') counts.Negotiating++;
      else if (app.status === 'Shortlisted' || app.status === 'Applying') counts.Applying++;
      else if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    let result = [...applications];

    if (activeStage !== 'All') {
      result = result.filter((app) => {
        if (activeStage === 'Interviewing') return app.status === 'Interviewing' || app.status === 'Interview';
        if (activeStage === 'Negotiating') return app.status === 'Negotiating' || app.status === 'Offer';
        if (activeStage === 'Applying') return app.status === 'Applying' || app.status === 'Shortlisted';
        return app.status === activeStage;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (app) =>
          app.company?.toLowerCase().includes(q) ||
          app.role?.toLowerCase().includes(q) ||
          app.location?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [applications, activeStage, searchQuery]);

  // Handle Excitement rating click
  const handleRatingChange = async (appId, newRating) => {
    try {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, excitement: newRating } : a))
      );
      await api.put(`/applications/${appId}`, { excitement: newRating });
    } catch (err) {
      console.error('Rating update failed:', err);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (appId, newStatus) => {
    try {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      await api.put(`/applications/${appId}`, { status: newStatus });
    } catch (err) {
      console.error('Status update failed:', err);
      fetchApplications();
    }
  };

  // Handle Add Job Submit
  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    if (!newJob.company.trim() || !newJob.role.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post('/applications', {
        company: newJob.company.trim(),
        role: newJob.role.trim(),
        location: newJob.location.trim(),
        salary: newJob.salary ? Number(newJob.salary) : undefined,
        status: newJob.status,
        jobUrl: newJob.jobUrl.trim(),
        excitement: newJob.excitement,
        dateSaved: new Date(),
        appliedDate: newJob.status === 'Applied' ? new Date() : undefined
      });

      setApplications([res.data, ...applications]);
      setShowAddModal(false);
      setNewJob({
        company: '',
        role: user?.primaryTargetTitle || 'Software Engineer',
        location: 'Remote',
        salary: '',
        status: 'Bookmarked',
        jobUrl: '',
        excitement: 4
      });
    } catch (err) {
      console.error('Failed to add application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (val) => {
    if (!val) return '—';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="py-4" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)' }}>
      <Container fluid="xl">
        {/* Sub-Navigation Tabs: Applications | Companies (NO People Tab!) */}
        <div className="tracker-subtabs">
          <Link to="/trackers" className="tracker-subtab active">
            <Layers size={18} />
            <span>Applications ({applications.length})</span>
          </Link>

          <Link to="/trackers/companies" className="tracker-subtab">
            <Building2 size={18} />
            <span>Companies Tracker</span>
          </Link>

          <div className="ms-auto d-flex align-items-center gap-2">
            <Link
              to="/job-search"
              className="btn btn-outline-teal btn-sm d-inline-flex align-items-center gap-1.5"
            >
              <Compass size={15} />
              <span>Explore Live Openings</span>
            </Link>

            <Button
              variant="teal"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="d-inline-flex align-items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} />
              <span>New Application</span>
            </Button>
          </div>
        </div>

        {feedback && <Alert variant="success" className="py-2 mb-3 shadow-sm">{feedback}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Pipeline Stage Cards */}
        <div className="pipeline-stepper">
          {PIPELINE_STAGES.map((stg) => {
            const count = stageCounts[stg.key] || 0;
            const isActive = activeStage === stg.key;
            return (
              <div
                key={stg.key}
                className={`pipeline-chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStage(stg.key)}
              >
                <div className="pipeline-count">{count}</div>
                <div className="pipeline-label">{stg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Toolbar: Search, Filters & View Toggle */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 bg-white p-3 rounded-3 border">
          <div className="position-relative flex-grow-1" style={{ maxWidth: '380px' }}>
            <Search
              size={16}
              className="position-absolute text-muted"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 py-2 rounded-2"
              placeholder="Search by position, company, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.88rem', borderColor: '#e2e8f0' }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              Showing <strong>{filteredApps.length}</strong> {activeStage === 'All' ? 'total' : activeStage} applications
            </span>

            <div className="btn-group border rounded-2 ms-2">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-teal' : 'btn-white text-muted'} py-1 px-2.5`}
                onClick={() => setViewMode('table')}
                title="Table List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'board' ? 'btn-teal' : 'btn-white text-muted'} py-1 px-2.5`}
                onClick={() => setViewMode('board')}
                title="Board View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Table or Board */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#004d40' }} />
            <p className="mt-2 text-muted small">Loading your tracked applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded-3 p-4">
            <Briefcase size={40} className="text-muted opacity-40 mb-2" />
            <h6 className="fw-bold text-dark">No applications found</h6>
            <p className="text-muted small mb-3">
              {activeStage !== 'All'
                ? `You have no applications currently marked as ${activeStage}.`
                : 'Start tracking job and internship applications or discover live portal openings.'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="teal" size="sm" onClick={() => setShowAddModal(true)}>
                + Add Application
              </Button>
              <Link to="/job-search" className="btn btn-outline-secondary btn-sm">
                Search Openings
              </Link>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white border rounded-3 overflow-hidden shadow-sm">
            <Table hover responsive className="align-middle mb-0" style={{ fontSize: '0.88rem' }}>
              <thead className="table-light text-secondary small text-uppercase fw-bold border-bottom">
                <tr>
                  <th className="ps-3 py-3">Role & Company</th>
                  <th>Location</th>
                  <th>Salary / CTC</th>
                  <th>Stage</th>
                  <th>Date Applied</th>
                  <th>Excitement</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    <td className="ps-3 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/applications/${app._id}`}
                          className="fw-bold text-dark text-decoration-none hover-primary"
                        >
                          {app.role}
                        </Link>
                        {app.source && app.source !== 'Manual' && (
                          <span
                            className="badge bg-light text-secondary border fw-medium"
                            style={{ fontSize: '0.68rem' }}
                          >
                            {app.source}
                          </span>
                        )}
                      </div>
                      <div className="text-muted small">
                        <Link
                          to="/trackers/companies"
                          className="text-secondary text-decoration-none fw-medium"
                        >
                          {app.company}
                        </Link>
                      </div>
                    </td>
                    <td className="text-secondary small">
                      {app.location ? (
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={13} className="text-muted" />
                          <span>{app.location}</span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="fw-semibold text-dark">{formatSalary(app.salary)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm py-1 ps-2 pe-4 border rounded-pill fw-semibold"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        style={{
                          fontSize: '0.78rem',
                          backgroundColor:
                            app.status === 'Accepted' || app.status === 'Offer'
                              ? '#dcfce7'
                              : app.status === 'Applied'
                              ? '#e0f2fe'
                              : app.status === 'Interviewing' || app.status === 'Interview'
                              ? '#fef3c7'
                              : '#f1f5f9',
                          color: '#0f172a'
                        }}
                      >
                        <option value="Bookmarked">Bookmarked</option>
                        <option value="Applying">Applying</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Negotiating">Negotiating / Offer</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="text-muted small">{formatDate(app.appliedDate || app.createdAt)}</td>
                    <td>
                      {/* Interactive Star Rating */}
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => handleRatingChange(app._id, star)}
                            className={star <= (app.excitement || 3) ? 'star-filled' : 'star-empty'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex align-items-center gap-1">
                        <Link
                          to={`/applications/${app._id}`}
                          className="btn btn-sm btn-light p-1.5 rounded-2 text-secondary"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-light p-1.5 rounded-2 text-secondary"
                            title="Job URL"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          /* Kanban Board View */
          <Row className="g-3">
            {filteredApps.map((app) => (
              <Col md={6} lg={4} key={app._id}>
                <Card className="border-0 shadow-sm rounded-3 h-100 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-secondary border small">{app.status}</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          onClick={() => handleRatingChange(app._id, s)}
                          className={s <= (app.excitement || 3) ? 'star-filled' : 'star-empty'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark mb-1">
                    <Link to={`/applications/${app._id}`} className="text-decoration-none text-dark">
                      {app.role}
                    </Link>
                  </h6>
                  <div className="text-secondary small fw-medium mb-3">{app.company}</div>

                  <div className="d-flex flex-wrap gap-2 text-muted small mt-auto pt-2 border-top">
                    <span>📍 {app.location || 'Remote'}</span>
                    <span>💰 {formatSalary(app.salary)}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Quick Add Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fs-6 fw-bold">Add Tracked Job</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddJobSubmit}>
            <Modal.Body className="py-3">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">
                  Role Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Software Engineer, Full Stack Developer"
                  value={newJob.role}
                  onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">
                  Company Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Google, Swiggy, Razorpay"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  required
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Bangalore / Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Salary (INR)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 1500000"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </Col>
              </Row>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Stage</Form.Label>
                  <Form.Select
                    value={newJob.status}
                    onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                  >
                    <option value="Bookmarked">Bookmarked</option>
                    <option value="Applying">Applying</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Negotiating">Negotiating / Offer</option>
                    <option value="Accepted">Accepted</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Excitement (1-5)</Form.Label>
                  <Form.Select
                    value={newJob.excitement}
                    onChange={(e) => setNewJob({ ...newJob, excitement: Number(e.target.value) })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Dream Role)</option>
                    <option value="4">⭐⭐⭐⭐☆ (4 - High Interest)</option>
                    <option value="3">⭐⭐⭐☆☆ (3 - Good Fit)</option>
                    <option value="2">⭐⭐☆☆☆ (2 - Backup)</option>
                  </Form.Select>
                </Col>
              </Row>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold text-secondary">Job URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://..."
                  value={newJob.jobUrl}
                  onChange={(e) => setNewJob({ ...newJob, jobUrl: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="teal" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Application'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default JobTracker;

