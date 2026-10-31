import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Layers,
  Building2,
  Search,
  Compass,
  Plus,
  LogOut,
  Target,
  Sparkles
} from 'lucide-react';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'KG';

  return (
    <>
      <nav className="bg-white border-bottom sticky-top py-2 px-3 shadow-sm">
        <Container fluid="xl" className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link to="/trackers" className="text-decoration-none d-flex align-items-center">
            <span className="brand-title">
              Job<span>Track</span>
            </span>
          </Link>

          {/* Main Navigation Links */}
          <div className="d-none d-md-flex align-items-center gap-1">
            <NavLink to="/home" className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}>
              <Target size={17} />
              <span>Target Roles</span>
            </NavLink>

            <NavLink to="/trackers" end className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}>
              <Layers size={17} />
              <span>Job Tracker</span>
            </NavLink>

            <NavLink to="/trackers/companies" className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}>
              <Building2 size={17} />
              <span>Companies</span>
            </NavLink>

            <NavLink to="/job-search" className={({ isActive }) => `nav-tab-link ${isActive ? 'active' : ''}`}>
              <Search size={17} />
              <span>Job Search</span>
            </NavLink>
          </div>

          {/* Right Action Tools & Profile */}
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/applications/new"
              className="btn btn-teal btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>Add Job</span>
            </Link>

            {/* User Profile Pill */}
            {user && (
              <div
                className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill border bg-light"
                onClick={() => setShowLogoutModal(true)}
                style={{ cursor: 'pointer' }}
                title={`${user.name} (${user.email}) - Click to Sign Out`}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#004d40',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {initials}
                </div>
                <span className="d-none d-lg-inline fw-semibold text-dark small pe-1">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </Container>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-6 fw-bold">Sign Out</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-secondary py-3 small">
          Are you sure you want to sign out of JobTrack?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" size="sm" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
            Sign Out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppNavbar;
