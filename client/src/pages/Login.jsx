import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/trackers');
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
      <Container style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold tracking-tight text-dark mb-1">
            Job<span style={{ color: '#004d40' }}>Track</span>
          </h2>
          <p className="text-muted small">Job Application & Tracker Platform</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Body className="p-4 p-sm-5">
            <h4 className="fw-bold text-dark mb-3">Sign In</h4>

            {isExpired && (
              <Alert variant="warning" className="small py-2 d-flex align-items-center gap-2">
                <span>Your session has expired. Please log in again.</span>
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="small py-2">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">Email Address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <Form.Control
                    type="email"
                    className="border-start-0 ps-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-secondary">Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <Form.Control
                    type="password"
                    className="border-start-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </Form>

            <div className="mt-4 pt-3 border-top text-center">
              <p className="text-muted small mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="fw-semibold text-teal text-decoration-none" style={{ color: '#004d40' }}>
                  Create one now
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
