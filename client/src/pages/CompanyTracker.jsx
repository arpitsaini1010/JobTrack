import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Form, Modal, Spinner, Alert, Badge, Row, Col, Card } from 'react-bootstrap';
import api from '../api/axios';
import {
  Building2,
  Layers,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Star,
  MapPin,
  Globe,
  Compass,
  ArrowRight,
  Briefcase
} from 'lucide-react';

const CompanyTracker = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Company Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Technology & Software',
    location: '',
    website: '',
    rating: 4,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/companies');
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Could not load company tracker.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post('/companies', newCompany);
      setCompanies([res.data, ...companies]);
      setShowAddModal(false);
      setNewCompany({
        name: '',
        industry: 'Technology & Software',
        location: '',
        website: '',
        rating: 4,
        notes: ''
      });
    } catch (err) {
      console.error('Failed to add company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Remove this company from your tracker?')) return;
    try {
      await api.delete(`/companies/${companyId}`);
      setCompanies(companies.filter((c) => c._id !== companyId));
    } catch (err) {
      console.error('Delete company error:', err);
    }
  };

  return (
    <div className="py-4" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)' }}>
      <Container fluid="xl">
        {/* Sub-Navigation Tabs: Applications | Companies Tracker (NO People Tab!) */}
        <div className="tracker-subtabs">
          <Link to="/trackers" className="tracker-subtab">
            <Layers size={18} />
            <span>Applications Tracker</span>
          </Link>

          <Link to="/trackers/companies" className="tracker-subtab active">
            <Building2 size={18} />
            <span>Companies Tracker ({companies.length})</span>
          </Link>

          <div className="ms-auto d-flex align-items-center gap-2">
            <Button
              variant="teal"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="d-inline-flex align-items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} />
              <span>Add Company</span>
            </Button>
          </div>
        </div>

        {feedback && <Alert variant="success" className="py-2 mb-3 shadow-sm">{feedback}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 bg-white p-3 rounded-3 border">
          <div className="position-relative flex-grow-1" style={{ maxWidth: '380px' }}>
            <Search
              size={16}
              className="position-absolute text-muted"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 py-2 rounded-2"
              placeholder="Search companies by name, industry, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.88rem', borderColor: '#e2e8f0' }}
            />
          </div>

          <div className="text-muted small">
            Showing <strong>{filteredCompanies.length}</strong> tracked organizations
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#004d40' }} />
            <p className="mt-2 text-muted small">Loading company tracker...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded-4 p-5 shadow-sm">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#e6f4f1',
                color: '#004d40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <Building2 size={32} />
            </div>
            <h5 className="fw-bold text-dark mb-2">No companies tracked yet</h5>
            <p className="text-muted small mb-4" style={{ maxWidth: '440px', margin: '0 auto 20px auto' }}>
              Whenever you apply to a job, the company is automatically tracked here. You can also add target dream companies manually.
            </p>
            <Button variant="teal" size="sm" onClick={() => setShowAddModal(true)}>
              + Add Target Company
            </Button>
          </div>
        ) : (
          <Row className="g-3">
            {filteredCompanies.map((comp) => (
              <Col lg={6} xl={4} key={comp._id}>
                <Card className="border-0 shadow-sm rounded-3 h-100 p-3 bg-white d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0 fs-5">{comp.name}</h6>
                      <span className="text-muted small" style={{ fontSize: '0.82rem' }}>
                        {comp.industry || 'Technology'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(comp._id)}
                      className="btn btn-sm btn-light text-danger p-1 rounded-circle border-0"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2 text-muted small mb-3">
                    {comp.location && (
                      <span className="d-inline-flex align-items-center gap-1">
                        <MapPin size={13} className="text-secondary" />
                        <span>{comp.location}</span>
                      </span>
                    )}
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Globe size={13} />
                        <span>Website</span>
                      </a>
                    )}
                  </div>

                  {/* Active Applications Badge */}
                  <div className="mb-3">
                    {comp.applicationsCount > 0 ? (
                      <Link
                        to={`/trackers?search=${encodeURIComponent(comp.name)}`}
                        className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 text-decoration-none d-inline-flex align-items-center gap-1.5"
                      >
                        <Briefcase size={13} />
                        <span>{comp.applicationsCount} Tracked Application(s)</span>
                        <ArrowRight size={11} />
                      </Link>
                    ) : (
                      <span className="badge bg-light text-muted border px-2.5 py-1.5">
                        Target List &bull; 0 Applications
                      </span>
                    )}
                  </div>

                  {/* Actions for Live Openings */}
                  <div className="d-flex align-items-center gap-1.5 mt-auto pt-2">
                    <Link
                      to={`/job-search?search=${encodeURIComponent(comp.name)}`}
                      className="btn btn-sm btn-outline-teal flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1 py-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <Search size={13} />
                      <span>Live Openings</span>
                    </Link>
                    <a
                      href={comp.website || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(comp.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 py-1 text-secondary"
                      style={{ fontSize: '0.78rem' }}
                      title="Open company careers page"
                    >
                      <span>Careers</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Add Company Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fs-6 fw-bold">Add Target Company</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddCompanySubmit}>
            <Modal.Body className="py-3">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">
                  Company Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Swiggy, Razorpay, Google"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                  autoFocus
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Industry</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Fintech, SaaS"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Bangalore, Remote..."
                    value={newCompany.location}
                    onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  />
                </Col>
              </Row>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold text-secondary">Careers Website</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://..."
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="teal" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Company'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default CompanyTracker;

