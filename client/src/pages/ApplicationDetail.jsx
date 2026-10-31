import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import StatusBadge, { PortalBadge, ListingStatusBadge } from '../components/StatusBadge';
import InterviewModal from '../components/InterviewModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  ExternalLink,
  ArrowLeft,
  Edit,
  Trash2,
  PlusCircle,
  Video,
  Clock,
  Award,
  History,
  CheckCircle2,
  FileText
} from 'lucide-react';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);

  const [deleteAppModal, setDeleteAppModal] = useState(false);
  const [deleteAppLoading, setDeleteAppLoading] = useState(false);

  const [deleteInterviewModal, setDeleteInterviewModal] = useState({
    show: false,
    interviewId: null,
    round: '',
    loading: false
  });

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      console.error('Failed to load application:', err);
      if (err.response?.status === 404) {
        setError('Application not found or you do not have permission to view it.');
      } else {
        setError('Failed to load application details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  // Interviews sorted ascending by date (FR-D4)
  const sortedInterviews = useMemo(() => {
    if (!application?.interviews) return [];
    return [...application.interviews].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [application?.interviews]);

  // Status history sorted by date
  const sortedHistory = useMemo(() => {
    if (!application?.statusHistory) return [];
    return [...application.statusHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [application?.statusHistory]);

  // Add / Edit Interview handler
  const handleSaveInterview = async (formData) => {
    if (editingInterview) {
      // Edit interview
      const res = await api.put(`/applications/${id}/interviews/${editingInterview._id}`, formData);
      setApplication(res.data);
    } else {
      // Add interview
      const res = await api.post(`/applications/${id}/interviews`, formData);
      setApplication(res.data);
    }
  };

  // Delete Interview handler
  const handleConfirmDeleteInterview = async () => {
    try {
      setDeleteInterviewModal((prev) => ({ ...prev, loading: true }));
      const res = await api.delete(`/applications/${id}/interviews/${deleteInterviewModal.interviewId}`);
      setApplication(res.data);
      setDeleteInterviewModal({ show: false, interviewId: null, round: '', loading: false });
    } catch (err) {
      console.error('Delete interview failed:', err);
      alert(err.response?.data?.message || 'Failed to delete interview round.');
      setDeleteInterviewModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Delete Application handler
  const handleConfirmDeleteApplication = async () => {
    try {
      setDeleteAppLoading(true);
      await api.delete(`/applications/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete application failed:', err);
      alert(err.response?.data?.message || 'Failed to delete application.');
      setDeleteAppLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2 text-muted fw-semibold">Loading application details...</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="py-5 bg-light min-vh-100">
        <Container style={{ maxWidth: '600px' }} className="text-center">
          <Alert variant="danger" className="mb-4">
            {error || 'Application not found.'}
          </Alert>
          <Button as={Link} to="/trackers" variant="teal" className="rounded-3">
            <ArrowLeft size={16} className="me-1" />
            Back to Job Tracker
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-4 bg-light min-vh-100">
      <Container fluid="xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-3">
          <Button
            as={Link}
            to="/trackers"
            variant="link"
            className="text-secondary p-0 d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
          >
            <ArrowLeft size={16} />
            <span>Back to Job Tracker</span>
          </Button>
        </div>

        {/* Overview Header Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h3 className="fw-bold text-dark mb-0 fs-2">{application.company}</h3>
                  <Badge
                    bg={application.type === 'Internship' ? 'info' : 'secondary'}
                    className="fw-medium px-2.5 py-1"
                  >
                    {application.type}
                  </Badge>
                    <StatusBadge status={application.status} size="normal" />
                    {application.source && application.source !== 'Manual' && (
                      <PortalBadge portal={application.source} />
                    )}
                    {application.listingStatus === 'Closed' && (
                      <ListingStatusBadge listingStatus="Closed" size="normal" />
                    )}
                  </div>
                  <h5 className="text-secondary fw-semibold mb-2 fs-6">{application.role}</h5>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
                    <span>📅 Applied: {formatDate(application.appliedDate)}</span>
                    {application.location && <span>📍 {application.location}</span>}
                    {application.salary !== undefined && (
                      <span>💰 {formatCurrency(application.salary)}</span>
                    )}
                    {application.jobUrl && (
                      <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                      >
                        <span>View Portal Posting</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Informative notice if portal listing closed */}
                  {application.listingStatus === 'Closed' && (
                    <div
                      className="p-2.5 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning-emphasis small mt-2 d-flex align-items-center gap-2"
                      style={{ maxWidth: '650px' }}
                    >
                      <Clock size={16} className="text-warning flex-shrink-0" />
                      <span>
                        <strong>Note:</strong> The employer has closed or expired this job listing on the external portal. All your application history, scheduled interview rounds, and notes are permanently preserved in your personal tracker.
                      </span>
                    </div>
                  )}
                </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2 align-self-start">
                <Button
                  as={Link}
                  to={`/applications/${application._id}/edit`}
                  variant="outline-primary"
                  className="d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 fw-semibold"
                  size="sm"
                >
                  <Edit size={16} />
                  <span>Edit Application</span>
                </Button>
                <Button
                  variant="outline-danger"
                  className="d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 fw-semibold"
                  size="sm"
                  onClick={() => setDeleteAppModal(true)}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Left Column: Details & Interviews */}
          <Col lg={8}>
            {/* Offer Section (FR-E1 & FR-E2) */}
            {(application.status === 'Offer' || application.offer) && (
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 border-start border-4 border-success">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Award size={18} />
                    </div>
                    <h5 className="fw-bold text-dark mb-0 fs-6">Job Offer Details</h5>
                  </div>
                  <Badge
                    bg={
                      application.offer?.decision === 'Accepted'
                        ? 'success'
                        : application.offer?.decision === 'Declined'
                        ? 'danger'
                        : 'warning'
                    }
                    className="px-3 py-1.5 rounded-pill fw-semibold"
                  >
                    Decision: {application.offer?.decision || 'Pending'}
                  </Badge>
                </Card.Header>
                <Card.Body className="p-4 pt-2">
                  <Row className="g-3">
                    <Col sm={6}>
                      <span className="text-muted small d-block">Offered Package (CTC)</span>
                      <span className="fw-bold text-dark fs-5">
                        {formatCurrency(application.offer?.ctc)}
                      </span>
                    </Col>
                    <Col sm={6}>
                      <span className="text-muted small d-block">Expected Joining Date</span>
                      <span className="fw-semibold text-dark">
                        {formatDate(application.offer?.joiningDate)}
                      </span>
                    </Col>
                    <Col sm={6}>
                      <span className="text-muted small d-block">Response Deadline</span>
                      <span className="fw-semibold text-dark">
                        {formatDate(application.offer?.deadline)}
                      </span>
                    </Col>
                    <Col sm={6}>
                      <span className="text-muted small d-block">Offer Status</span>
                      <span className="fw-semibold text-secondary">
                        {application.offer?.decision || 'Pending response'}
                      </span>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Application Overview Details */}
            <Card className="border-0 shadow-sm rounded-4 bg-white mb-4">
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                <h5 className="fw-bold text-dark mb-0 fs-6">Application Information</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col sm={6}>
                    <span className="text-muted small d-block">Company</span>
                    <span className="fw-semibold text-dark">{application.company}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted small d-block">Role</span>
                    <span className="fw-semibold text-dark">{application.role}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted small d-block">Location</span>
                    <span className="fw-semibold text-dark">{application.location || '—'}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted small d-block">Application Type</span>
                    <span className="fw-semibold text-dark">{application.type}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted small d-block">Salary / Compensation</span>
                    <span className="fw-semibold text-dark">{formatCurrency(application.salary)}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted small d-block">Job Posting</span>
                    {application.jobUrl ? (
                      <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold small"
                      >
                        <span>Open Posting</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Col>
                  {application.notes && (
                    <Col xs={12} className="pt-2 border-top">
                      <span className="text-muted small d-block mb-1">Notes & Details</span>
                      <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {application.notes}
                      </p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Interview Rounds Tracking (FR-D1 to FR-D4) */}
            <Card className="border-0 shadow-sm rounded-4 bg-white mb-4">
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0 fs-6">Interview Rounds</h5>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {sortedInterviews.length} rounds logged
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-1.5 rounded-3 fw-semibold px-3 py-1.5"
                  onClick={() => {
                    setEditingInterview(null);
                    setShowInterviewModal(true);
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Add Interview</span>
                </Button>
              </Card.Header>

              <Card.Body className="p-4 pt-2">
                {sortedInterviews.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Clock size={36} className="text-secondary mb-2 opacity-50" />
                    <h6 className="fw-bold text-secondary mb-1">No Interview Rounds Yet</h6>
                    <p className="small mb-3" style={{ maxWidth: '360px', margin: '0 auto' }}>
                      Schedule your technical rounds, HR meetings, or managerial interviews to track dates and preparation notes.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-3 px-3 py-1.5 fw-semibold"
                      style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                      onClick={() => {
                        setEditingInterview(null);
                        setShowInterviewModal(true);
                      }}
                    >
                      <PlusCircle size={16} className="me-1" />
                      Add First Interview Round
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {sortedInterviews.map((interview, idx) => (
                      <div
                        key={interview._id || idx}
                        className="p-3.5 rounded-3 border bg-light position-relative"
                      >
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2 mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary text-white rounded-circle p-1 px-2" style={{ fontSize: '0.7rem' }}>
                                #{idx + 1}
                              </span>
                              <h6 className="fw-bold text-dark mb-0">{interview.round}</h6>
                              <Badge bg="light" text="secondary" className="border">
                                {interview.type}
                              </Badge>
                            </div>
                            <span className="text-muted small mt-1 d-block">
                              📅 {formatDateTime(interview.date)}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            {interview.meetingLink && (
                              <Button
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                variant="outline-primary"
                                size="sm"
                                className="d-flex align-items-center gap-1 rounded-pill px-2.5 py-1"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <Video size={13} />
                                <span>Meeting Link</span>
                              </Button>
                            )}
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 text-secondary rounded-2"
                              title="Edit Interview"
                              onClick={() => {
                                setEditingInterview(interview);
                                setShowInterviewModal(true);
                              }}
                            >
                              <Edit size={15} />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 text-danger rounded-2"
                              title="Delete Interview"
                              onClick={() => {
                                setDeleteInterviewModal({
                                  show: true,
                                  interviewId: interview._id,
                                  round: interview.round,
                                  loading: false
                                });
                              }}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>

                        {interview.notes && (
                          <div className="mt-2 pt-2 border-top">
                            <span className="text-muted small d-block fw-semibold">Notes:</span>
                            <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                              {interview.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Status History Timeline (FR-C5) */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-white sticky-top" style={{ top: '80px' }}>
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <History size={18} />
                </div>
                <h5 className="fw-bold text-dark mb-0 fs-6">Status History</h5>
              </Card.Header>
              <Card.Body className="p-4 pt-2">
                <div className="timeline-container">
                  {sortedHistory.map((item, index) => {
                    const isLast = index === sortedHistory.length - 1;
                    return (
                      <div key={item._id || index} className="timeline-item">
                        <div className="timeline-marker" />
                        <div className="timeline-content pb-3">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <StatusBadge status={item.status} size="sm" />
                            {isLast && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatDateTime(item.date)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add / Edit Interview Modal */}
      <InterviewModal
        show={showInterviewModal}
        onHide={() => {
          setShowInterviewModal(false);
          setEditingInterview(null);
        }}
        onSubmit={handleSaveInterview}
        initialData={editingInterview}
        isEditing={Boolean(editingInterview)}
      />

      {/* Delete Interview Confirmation Modal (FR-D3) */}
      <ConfirmModal
        show={deleteInterviewModal.show}
        onHide={() =>
          setDeleteInterviewModal((prev) => ({ ...prev, show: false }))
        }
        onConfirm={handleConfirmDeleteInterview}
        title="Delete Interview Round"
        message={`Are you sure you want to delete the round "${deleteInterviewModal.round}"?`}
        confirmText="Delete Round"
        loading={deleteInterviewModal.loading}
      />

      {/* Delete Application Confirmation Modal (FR-B6) */}
      <ConfirmModal
        show={deleteAppModal}
        onHide={() => setDeleteAppModal(false)}
        onConfirm={handleConfirmDeleteApplication}
        title="Delete Application"
        message={`Are you sure you want to delete your application for "${application.role}" at ${application.company}? This will permanently remove all associated interview rounds and offer information.`}
        confirmText="Delete Application"
        loading={deleteAppLoading}
      />
    </div>
  );
};

export default ApplicationDetail;
