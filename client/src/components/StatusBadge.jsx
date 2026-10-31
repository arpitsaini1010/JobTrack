import React from 'react';

const statusConfig = {
  Applied: {
    bg: '#E0F2FE',
    color: '#0369A1',
    border: '#BAE6FD',
    dot: '#0284C7'
  },
  Shortlisted: {
    bg: '#EDE9FE',
    color: '#6D28D9',
    border: '#DDD6FE',
    dot: '#7C3AED'
  },
  Interview: {
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
    dot: '#F59E0B'
  },
  Offer: {
    bg: '#DCFCE7',
    color: '#15803D',
    border: '#BBF7D0',
    dot: '#16A34A'
  },
  Rejected: {
    bg: '#FFE4E6',
    color: '#BE123C',
    border: '#FECDD3',
    dot: '#E11D48'
  },
  Withdrawn: {
    bg: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
    dot: '#64748B'
  }
};

const portalConfig = {
  'LinkedIn': {
    bg: '#f0f9ff',
    color: '#0369a1',
    border: '#bae6fd',
    label: 'LinkedIn'
  },
  'Indeed': {
    bg: '#eef2ff',
    color: '#3730a3',
    border: '#c7d2fe',
    label: 'Indeed'
  },
  'Glassdoor': {
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    label: 'Glassdoor'
  },
  'LinkedIn': {
    bg: '#f0f9ff',
    color: '#0369a1',
    border: '#bae6fd',
    label: 'LinkedIn'
  },
  'ArbeitNow': {
    bg: '#eef2ff',
    color: '#4338ca',
    border: '#c7d2fe',
    label: 'ArbeitNow Live'
  },
  'Remotive': {
    bg: '#ecfdf5',
    color: '#065f46',
    border: '#a7f3d0',
    label: 'Remotive Live'
  },
  'Jobicy': {
    bg: '#fffbeb',
    color: '#92400e',
    border: '#fde68a',
    label: 'Jobicy Live'
  },
  'Direct': {
    bg: '#f0fdf4',
    color: '#166534',
    border: '#bbf7d0',
    label: 'Company Career Page'
  },
  'Manual': {
    bg: '#f8fafc',
    color: '#64748b',
    border: '#e2e8f0',
    label: 'Manual'
  }
};

export const StatusBadge = ({ status = 'Applied', size = 'normal', showDot = true }) => {
  const config = statusConfig[status] || statusConfig.Applied;
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        fontWeight: '600',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      {showDot && (
        <span
          style={{
            width: isSmall ? '6px' : '8px',
            height: isSmall ? '6px' : '8px',
            borderRadius: '50%',
            backgroundColor: config.dot
          }}
        />
      )}
      {status}
    </span>
  );
};

export const PortalBadge = ({ portal = 'Direct', size = 'normal' }) => {
  const config = portalConfig[portal] || portalConfig.Direct;
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '6px',
        padding: isSmall ? '2px 6px' : '3px 10px',
        fontSize: isSmall ? '0.72rem' : '0.8rem',
        fontWeight: '600',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>⚡</span>
      {config.label || portal}
    </span>
  );
};

export const ListingStatusBadge = ({ listingStatus = 'Active', size = 'sm' }) => {
  const isClosed = listingStatus === 'Closed';
  const isSmall = size === 'sm';

  if (!isClosed) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#ecfdf5',
          color: '#047857',
          border: '1px solid #a7f3d0',
          borderRadius: '9999px',
          padding: isSmall ? '2px 8px' : '3px 10px',
          fontSize: isSmall ? '0.72rem' : '0.78rem',
          fontWeight: '600'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        Active on Portal
      </span>
    );
  }

  return (
    <span
      title="The company has closed this opening on the portal, but your application is permanently saved in your tracker!"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#fffbeb',
        color: '#b45309',
        border: '1px solid #fde68a',
        borderRadius: '9999px',
        padding: isSmall ? '2px 8px' : '3px 10px',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: '600'
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
      Listing Closed · Tracked
    </span>
  );
};

export default StatusBadge;
