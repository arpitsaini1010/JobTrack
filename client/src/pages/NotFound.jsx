import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <Container style={{ maxWidth: '480px' }} className="text-center">
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#e0e7ff',
            color: '#4f46e5'
          }}
        >
          <Compass size={36} />
        </div>
        <h1 className="fw-bold text-dark display-6 mb-2">404 - Page Not Found</h1>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          as={Link}
          to="/trackers"
          variant="teal"
          className="rounded-3 px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
        >
          <ArrowLeft size={16} />
          <span>Return to Job Tracker</span>
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;
