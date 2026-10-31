import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Calendar, Video, FileText, CheckCircle2 } from 'lucide-react';

const interviewTypes = ['Technical', 'HR', 'Managerial', 'Aptitude', 'Group Discussion', 'Other'];

const InterviewModal = ({ show, onHide, onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    round: '',
    type: 'Technical',
    date: '',
    meetingLink: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Format date for datetime-local input: YYYY-MM-DDTHH:mm
      let formattedDate = '';
      if (initialData.date) {
        const d = new Date(initialData.date);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }

      setFormData({
        round: initialData.round || '',
        type: initialData.type || 'Technical',
        date: formattedDate,
        meetingLink: initialData.meetingLink || '',
        notes: initialData.notes || ''
      });
    } else {
      // Default date to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        round: '',
        type: 'Technical',
        date: defaultDate,
        meetingLink: '',
        notes: ''
      });
    }
    setError('');
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.round.trim()) {
      setError('Please provide a round name (e.g. Technical Round 1)');
      return;
    }
    if (!formData.date) {
      setError('Please provide the interview date and time');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save interview round.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold text-dark">
            {isEditing ? 'Edit Interview Round' : 'Schedule / Log Interview Round'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="py-2 fs-7">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Round Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="round"
              value={formData.round}
              onChange={handleChange}
              placeholder="e.g. Technical Round 1, System Design, HR Discussion"
              required
              autoFocus
            />
          </Form.Group>

          <Row>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">Interview Type</Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleChange}>
                  {interviewTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Date & Time <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">Meeting Link (Optional)</Form.Label>
            <Form.Control
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/... or https://teams.microsoft.com/..."
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold small text-secondary">Preparation / Debrief Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Topics to prepare, questions asked, panel feedback, etc."
              maxLength={1000}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light border-top-0 pt-0">
          <Button variant="secondary" size="sm" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={submitting} className="d-flex align-items-center gap-1">
            <CheckCircle2 size={16} />
            <span>{isEditing ? 'Save Changes' : 'Add Interview'}</span>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InterviewModal;
