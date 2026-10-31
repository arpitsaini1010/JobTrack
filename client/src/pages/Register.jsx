import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      setError('Name must be between 2 and 50 characters.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name.trim(),
      formData.email.trim(),
      formData.password,
      formData.confirmPassword
    );
    setLoading(false);

    if (result.success) {
      navigate('/home'); // Send to Target Roles selection
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-5"
      style={{
        backgroundColor: '#f8fafc'
      }}
    >
      <Container style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold tracking-tight text-dark mb-1">
            Job<span style={{ color: '#004d40' }}>Track</span>
          </h2>
          <p className="text-muted small">Create an account to start tracking your applications</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Body className="p-4 p-sm-5">
            <h4 className="fw-bold text-dark mb-3">Create an Account</h4>

            {error && (
              <Alert variant="danger" className="small py-2 mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <User size={16} />
                  </span>
                  <Form.Control
                    type="text"
                    name="name"
                    className="border-start-0 ps-0"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <Form.Control
                    type="email"
                    name="email"
                    className="border-start-0 ps-0"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <Form.Control
                    type="password"
                    name="password"
                    className="border-start-0 ps-0"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-secondary">
                  Confirm Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    className="border-start-0 ps-0"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              <Button
                variant="teal"
                type="submit"
                className="w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Register</span>
                  </>
                )}
              </Button>
            </Form>

            <div className="mt-4 pt-3 border-top text-center">
              <p className="text-muted small mb-0">
                Already have an account?{' '}
                <Link to="/login" className="fw-semibold text-teal text-decoration-none" style={{ color: '#004d40' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Register;
