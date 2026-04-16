import { System } from '../services/api';

interface SystemCardProps {
  system: System;
}

function SystemCard({ system }: SystemCardProps) {
  const handleClick = () => {
    if (system.enabled) {
      window.location.href = system.url;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '280px',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: system.enabled ? '#ffffff' : '#f3f4f6',
        cursor: system.enabled ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s',
        opacity: system.enabled ? 1 : 0.6
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '8px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        fontSize: '32px'
      }}>
        {system.logo ? (
          <img src={system.logo} alt={system.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          '📦'
        )}
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#1f2937',
        marginBottom: '8px'
      }}>
        {system.name}
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        lineHeight: '1.5'
      }}>
        {system.description}
      </p>
      {!system.enabled && (
        <span style={{
          display: 'inline-block',
          marginTop: '12px',
          fontSize: '12px',
          color: '#9ca3af',
          backgroundColor: '#e5e7eb',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          已禁用
        </span>
      )}
    </div>
  );
}

export default SystemCard;
