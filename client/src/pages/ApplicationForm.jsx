import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Link2,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Award
} from 'lucide-react';

const statuses = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const offerDecisions = ['Pending', 'Accepted', 'Declined'];

const ApplicationForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    type: 'Job',
    salary: '',
    appliedDate: new Date().toISOString().split('T')[0],
    jobUrl: '',
    notes: '',
    source: 'Manual',
    listingStatus: 'Active',
    status: 'Applied',
    offer: {
      ctc: '',
      joiningDate: '',
      deadline: '',
      decision: 'Pending'
    }
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch existing application if editing
  useEffect(() => {
    if (isEditing) {
      const fetchApp = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/applications/${id}`);
          const app = res.data;

          setFormData({
            company: app.company || '',
            role: app.role || '',
            location: app.location || '',
            type: app.type || 'Job',
            salary: app.salary !== undefined && app.salary !== null ? app.salary : '',
            appliedDate: app.appliedDate ? app.appliedDate.split('T')[0] : new Date().toISOString().split('T')[0],
            jobUrl: app.jobUrl || '',
            notes: app.notes || '',
            source: app.source || 'Manual',
            listingStatus: app.listingStatus || 'Active',
            status: app.status || 'Applied',
            offer: {
              ctc: app.offer?.ctc !== undefined && app.offer?.ctc !== null ? app.offer.ctc : '',
              joiningDate: app.offer?.joiningDate ? app.offer.joiningDate.split('T')[0] : '',
              deadline: app.offer?.deadline ? app.offer.deadline.split('T')[0] : '',
              decision: app.offer?.decision || 'Pending'
            }
          });
        } catch (err) {
          console.error('Failed to load application:', err);
          setError(err.response?.data?.message || 'Failed to load application details.');
        } finally {
          setLoading(false);
        }
      };

      fetchApp();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Pre-submission validation (FR-B1 & TC-8)
    if (!formData.company.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!formData.role.trim()) {
      setError('Role title is required.');
      return;
    }

    if (formData.salary !== '' && Number(formData.salary) < 0) {
      setError('Salary cannot be negative.');
      return;
    }

    // Offer CTC validation (TC-12)
    if (formData.status === 'Offer' || formData.offer.ctc !== '') {
      if (formData.offer.ctc !== '' && Number(formData.offer.ctc) < 0) {
        setError('Offer CTC cannot be negative.');
        return;
      }
    }

    // Prepare payload
    const payload = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      type: formData.type,
      salary: formData.salary !== '' ? Number(formData.salary) : undefined,
      appliedDate: formData.appliedDate,
      jobUrl: formData.jobUrl.trim(),
      notes: formData.notes.trim(),
      status: formData.status
    };

    // Include offer only if status is Offer or if offer has CTC/deadline
    if (formData.status === 'Offer' || formData.offer.ctc !== '') {
      payload.offer = {
        ctc: formData.offer.ctc !== '' ? Number(formData.offer.ctc) : undefined,
        joiningDate: formData.offer.joiningDate || undefined,
        deadline: formData.offer.deadline || undefined,
        decision: formData.offer.decision || 'Pending'
      };
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put(`/applications/${id}`, payload);
        setSuccessMsg('Application updated successfully!');
        setTimeout(() => navigate(`/applications/${id}`), 800);
      } else {
        const res = await api.post('/applications', payload);
        setSuccessMsg('Application created successfully!');
        setTimeout(() => navigate(`/applications/${res.data._id}`), 800);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.response?.data?.message || 'Failed to save application. Please verify your input.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2 text-muted fw-semibold">Loading application...</span>
      </div>
    );
  }

  return (
    <div className="py-4 bg-light min-vh-100">
      <Container style={{ maxWidth: '820px' }}>
        <div className="mb-3">
          <Button
            as={Link}
            to={isEditing ? `/applications/${id}` : '/trackers'}
            variant="link"
            className="text-secondary p-0 d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
          >
            <ArrowLeft size={16} />
            <span>{isEditing ? 'Back to Application Details' : 'Back to Job Tracker'}</span>
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <Card.Header className="bg-white border-bottom p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                }}
              >
                <Briefcase size={22} />
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0 fs-5">
                  {isEditing ? 'Edit Application' : 'Add New Application'}
                </h4>
                <p className="text-muted small mb-0">
                  {isEditing
                    ? 'Update job details, current hiring status, and offer information'
                    : 'Log a new job or internship opportunity you have applied to'}
                </p>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="p-4 p-md-5">
            {error && <Alert variant="danger">{error}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Core Information Section */}
              <h6 className="fw-bold text-secondary text-uppercase tracking-wider small mb-3">
                Job Overview
              </h6>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Company Name <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Building2 size={16} />
                      </span>
                      <Form.Control
                        type="text"
                        name="company"
                        placeholder="e.g. Google, Microsoft, Infosys"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        autoFocus
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Role / Position Title <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Briefcase size={16} />
                      </span>
                      <Form.Control
                        type="text"
                        name="role"
                        placeholder="e.g. Software Engineer, React Developer"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        maxLength={100}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">Location</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <MapPin size={16} />
                      </span>
                      <Form.Control
                        type="text"
                        name="location"
                        placeholder="e.g. Bangalore, Remote, Hybrid"
                        value={formData.location}
                        onChange={handleChange}
                        maxLength={100}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Application Type
                    </Form.Label>
                    <Form.Select name="type" value={formData.type} onChange={handleChange}>
                      <option value="Job">Full-time Job</option>
                      <option value="Internship">Internship</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Expected Salary / Stipend (INR)
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <IndianRupee size={16} />
                      </span>
                      <Form.Control
                        type="number"
                        name="salary"
                        placeholder="e.g. 1200000"
                        min="0"
                        value={formData.salary}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Applied Date <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Calendar size={16} />
                      </span>
                      <Form.Control
                        type="date"
                        name="appliedDate"
                        value={formData.appliedDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Status & Online Links */}
              <h6 className="fw-bold text-secondary text-uppercase tracking-wider small mb-3 pt-3 border-top">
                Tracking & Notes
              </h6>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Current Hiring Status
                    </Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Source / Portal
                    </Form.Label>
                    <Form.Select name="source" value={formData.source} onChange={handleChange}>
                      <option value="Manual">Manual Entry</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Direct">Company Career Site</option>
                      <option value="Indeed">Indeed</option>
                      <option value="Glassdoor">Glassdoor</option>
                      <option value="Campus Placement">Campus Placement</option>
                      <option value="Referral">Employee Referral</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Job Posting URL
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Link2 size={16} />
                      </span>
                      <Form.Control
                        type="url"
                        name="jobUrl"
                        placeholder="https://..."
                        value={formData.jobUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Application Notes
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      placeholder="Referral contacts, job description highlights, follow-up checklist..."
                      value={formData.notes}
                      onChange={handleChange}
                      maxLength={1000}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Offer Details Section (Shown when status is Offer or when Offer details exist) */}
              {formData.status === 'Offer' && (
                <div className="p-4 rounded-3 border bg-light mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Award size={20} className="text-success" />
                    <h6 className="fw-bold text-dark mb-0 fs-6">Official Offer Details</h6>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">
                          Offered CTC / Package (INR)
                        </Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-white text-muted">
                            <IndianRupee size={16} />
                          </span>
                          <Form.Control
                            type="number"
                            name="ctc"
                            min="0"
                            placeholder="e.g. 1500000"
                            value={formData.offer.ctc}
                            onChange={handleOfferChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">
                          Decision Status
                        </Form.Label>
                        <Form.Select
                          name="decision"
                          value={formData.offer.decision}
                          onChange={handleOfferChange}
                        >
                          {offerDecisions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">
                          Expected Joining Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="joiningDate"
                          value={formData.offer.joiningDate}
                          onChange={handleOfferChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary">
                          Acceptance / Response Deadline
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="deadline"
                          value={formData.offer.deadline}
                          onChange={handleOfferChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="d-flex align-items-center justify-content-end gap-3 pt-3 border-top">
                <Button
                  as={Link}
                  to={isEditing ? `/applications/${id}` : '/dashboard'}
                  variant="light"
                  disabled={submitting}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm fw-semibold"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>{isEditing ? 'Save Changes' : 'Create Application'}</span>
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ApplicationForm;
