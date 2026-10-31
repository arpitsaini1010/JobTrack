import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Briefcase,
  Layers,
  Compass,
  X
} from 'lucide-react';

const COMMON_TITLES = [
  'Software Engineer',
  'Software Engineer II',
  'Software Engineer III',
  'Software Engineering Intern',
  'Software Engineer Intern',
  'Software Engineering Manager',
  'Associate Software Engineer',
  'Senior Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'MERN Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Product Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Cloud Engineer'
];

const RECOMMENDATION_MAP = {
  'Software Engineer': ['Full Stack Developer', 'Frontend Developer', 'Backend Engineer', 'MERN Stack Developer', 'Software Engineer II'],
  'Frontend Developer': ['React Developer', 'UI/UX Engineer', 'Full Stack Developer', 'Next.js Developer'],
  'Full Stack Developer': ['MERN Stack Developer', 'Software Engineer', 'Backend Developer', 'React Developer'],
  'Backend Developer': ['Node.js Developer', 'Software Engineer', 'Cloud Engineer', 'Database Specialist'],
  'Software Engineering Intern': ['Software Engineer Intern', 'Associate Software Engineer', 'Junior Web Developer']
};

const TitleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState(user?.primaryTargetTitle || 'Software Engineer');
  const [selectedTitles, setSelectedTitles] = useState(
    user?.targetJobTitles && user.targetJobTitles.length > 0
      ? user.targetJobTitles
      : user?.primaryTargetTitle
      ? [user.primaryTargetTitle]
      : ['Software Engineer']
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Suggestions matching query
  const suggestions = useMemo(() => {
    if (!query.trim()) return COMMON_TITLES.slice(0, 8);
    const q = query.toLowerCase().trim();
    return COMMON_TITLES.filter((t) => t.toLowerCase().includes(q));
  }, [query]);

  // Recommended related titles
  const recommendations = useMemo(() => {
    const primary = selectedTitles[0] || query;
    for (const [key, related] of Object.entries(RECOMMENDATION_MAP)) {
      if (primary.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(primary.toLowerCase())) {
        return related;
      }
    }
    return ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'MERN Stack Developer'];
  }, [selectedTitles, query]);

  const handleSelectTitle = (title) => {
    if (!selectedTitles.includes(title)) {
      setSelectedTitles([...selectedTitles, title]);
    }
    setQuery(title);
    setDropdownOpen(false);
  };

  const handleRemoveTitle = (titleToRemove) => {
    setSelectedTitles(selectedTitles.filter((t) => t !== titleToRemove));
  };

  const handleSavePreferences = async (redirectTo = '/trackers') => {
    const primary = selectedTitles[0] || query.trim() || 'Software Engineer';
    const allTitles = selectedTitles.length > 0 ? selectedTitles : [primary];

    try {
      setSaving(true);
      await api.put('/auth/target-titles', {
        primaryTargetTitle: primary,
        targetJobTitles: allTitles
      });
      setSavedSuccess(true);
      setTimeout(() => {
        navigate(redirectTo);
      }, 300);
    } catch (err) {
      console.error('Failed to save titles:', err);
      navigate(redirectTo);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)' }}>
      <Container style={{ maxWidth: '820px' }}>
        {/* Header Hero Card */}
        <div className="text-center mb-5">
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3"
            style={{ backgroundColor: '#e6f4f1', color: '#004d40', fontSize: '0.82rem', fontWeight: '700' }}
          >
            <Target size={15} />
            <span>Target Role Intelligence</span>
          </div>

          <h1 className="display-6 fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>
            What job title are you looking for?
          </h1>
          <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            Tell us your target roles to receive personalized job feeds, similar company matches, and automatic tracker tracking.
          </p>
        </div>

        {/* Input & Autocomplete Card */}
        <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
          <div className="position-relative mb-4">
            <label className="fw-semibold text-secondary small mb-2 d-flex align-items-center gap-1.5">
              <Search size={15} style={{ color: '#004d40' }} />
              <span>Search or Enter Your Desired Job Title</span>
            </label>

            <input
              type="text"
              className="title-search-input-box"
              placeholder="e.g. Software Engineer, Full Stack Developer..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
            />

            {/* Autocomplete Dropdown */}
            {dropdownOpen && suggestions.length > 0 && (
              <div className="title-suggestions-dropdown">
                {suggestions.map((title) => {
                  const isSelected = selectedTitles.includes(title);
                  return (
                    <div
                      key={title}
                      className="title-suggestion-item d-flex align-items-center justify-content-between"
                      onClick={() => handleSelectTitle(title)}
                    >
                      <span>{title}</span>
                      {isSelected ? (
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success small">Selected</span>
                      ) : (
                        <span className="text-muted small">+ Add</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Roles Tags */}
          {selectedTitles.length > 0 && (
            <div className="mb-4">
              <div className="small fw-bold text-uppercase tracking-wider text-muted mb-2">
                Your Selected Target Titles ({selectedTitles.length})
              </div>
              <div className="d-flex flex-wrap gap-2">
                {selectedTitles.map((t) => (
                  <span
                    key={t}
                    className="badge py-2 px-3 rounded-pill d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#004d40', color: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <span>{t}</span>
                    <X
                      size={14}
                      style={{ cursor: 'pointer', opacity: 0.8 }}
                      onClick={() => handleRemoveTitle(t)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommended Related Titles */}
          <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#f0fdf4', border: '1px solid #ccfbf1' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Sparkles size={16} className="text-success" />
              <span className="fw-bold text-dark small">
                Recommended Titles Based on Your Focus:
              </span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {recommendations.map((rec) => {
                const isSelected = selectedTitles.includes(rec);
                return (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => handleSelectTitle(rec)}
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                      isSelected ? 'btn-teal' : 'btn-white bg-white text-secondary border'
                    }`}
                    style={{ fontSize: '0.82rem' }}
                  >
                    {rec} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3 pt-2">
            <Button
              variant="teal"
              size="lg"
              className="w-100 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={() => handleSavePreferences('/trackers')}
              disabled={saving}
            >
              {saving ? <Spinner animation="border" size="sm" /> : <Layers size={18} />}
              <span>Save & Go to Job Tracker</span>
              <ArrowRight size={17} />
            </Button>

            <Button
              variant="outline-teal"
              size="lg"
              className="w-100 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => handleSavePreferences(`/job-search?search=${encodeURIComponent(selectedTitles[0] || query)}`)}
              disabled={saving}
            >
              <Compass size={18} />
              <span>Explore Live Openings</span>
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default TitleOnboarding;
