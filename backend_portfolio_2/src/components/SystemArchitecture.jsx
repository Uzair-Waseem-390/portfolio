// components/SystemArchitecture.jsx
import React, { useState } from 'react';

const ArchitectureBlock = ({ label, description, details }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-blue-500/50 hover:bg-gray-900 transition-all group"
      >
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="font-medium text-sm text-gray-200 group-hover:text-blue-400">{description}</div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-400">{label}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>
            <div className="space-y-4">
              {details.map((detail, idx) => (
                <div key={idx} className="border-l-2 border-blue-500/30 pl-4">
                  <p className="text-sm text-gray-300">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SystemArchitecture = () => {
  const architectureLayers = [
    { 
      label: 'Client', 
      description: 'React Frontend',
      details: [
        'Makes API requests to simulated endpoints',
        'Handles request/response formatting',
        'Manages framework-specific UI rendering'
      ]
    },
    { 
      label: 'API Layer', 
      description: 'Request Routing · Auth · Rate Limiting',
      details: [
        'Handles routing of API requests',
        'Validates incoming request structure',
        'Authentication middleware (JWT validation)',
        'Rate limiting: 10-100 requests/minute based on endpoint'
      ]
    },
    { 
      label: 'Business Logic', 
      description: 'Service Layer · Validation',
      details: [
        'Separation of concerns architecture',
        'Service layer pattern implementation',
        'Input validation and sanitization',
        'Framework-specific logic handling'
      ]
    },
    { 
      label: 'ORM', 
      description: 'Model Relationships · Query Optimization',
      details: [
        'Django ORM / SQLAlchemy (conceptual)',
        'Model relationships: ForeignKey, ManyToMany',
        'Query optimization with select_related/prefetch_related',
        'Migration strategy for schema changes'
      ]
    },
    { 
      label: 'Database', 
      description: 'PostgreSQL · Indexed Queries',
      details: [
        'PostgreSQL 15 (simulated)',
        'Proper indexing on foreign keys and frequently queried fields',
        'Normalization up to 3NF',
        'Transaction support with ACID compliance'
      ]
    },
    { 
      label: 'Cache', 
      description: 'Redis · Read-heavy Optimization',
      details: [
        'Redis for session storage and caching',
        'Cache frequently accessed data (30% reduction in queries)',
        'Cache invalidation strategy on data updates',
        'Used for rate limiting counters'
      ]
    },
    { 
      label: 'Worker', 
      description: 'Background Tasks · Async Jobs',
      details: [
        'Celery / RQ for background processing',
        'Email sending (verification, password reset)',
        'AI job processing (simulated)',
        'Report generation for analytics'
      ]
    }
  ];

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">SYSTEM ARCHITECTURE FLOW</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {architectureLayers.map((layer, idx) => (
          <React.Fragment key={layer.label}>
            <ArchitectureBlock 
              label={layer.label}
              description={layer.description}
              details={layer.details}
            />
            {idx < architectureLayers.length - 1 && (
              <div className="hidden lg:flex items-center text-gray-700 text-xs">
                <span>→</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-4 text-center">
        Click any block to view detailed explanation
      </p>
    </div>
  );
};

export default SystemArchitecture;