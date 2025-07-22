import React, { useState, useRef, useEffect } from 'react';
import Settings from './Settings';
import ProgressTracker from './ProgressTracker';
import GoalsOverview from './GoalsOverview';
import PoseTracer from './PoseTracker';
import PhysiqueRating from './PhysiqueRating';
import ChatWithCoach from './ChatWithCoach';
import 'bootstrap/dist/css/bootstrap.min.css';

const tabs = [
  { id: 'progress', label: '📈 Progress' },
  { id: 'goals', label: '🎯 Goals' },
  { id: 'pose', label: '🧍‍♂️ Pose Tracker' },
  { id: 'physique', label: '💪 Physique Rating' },
  { id: 'chat', label: '💬 Chat with Coach' },
  { id: 'settings', label: '⚙️ Settings' },
];

export default function Dashboard({ profile }) {
  const [activeTab, setActiveTab] = useState('progress');
  const navRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  // Calculate and animate sliding underline
  useEffect(() => {
    if (!navRef.current) return;

    const activeBtn = navRef.current.querySelector(
      `[aria-selected="true"]`
    );
    if (!activeBtn) return;

    const { offsetLeft, offsetWidth } = activeBtn;

    setUnderlineStyle({
      left: offsetLeft,
      width: offsetWidth,
    });
  }, [activeTab]);

  return (
    <div className="bg-dark text-light min-vh-100 py-4 px-2 px-sm-4 d-flex flex-column">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="display-5 fw-bold text-info">
          Welcome back, {profile?.name || 'Athlete'} 💪
        </h1>
        <p className="text-muted">Let’s dominate today’s session.</p>
      </header>

      {/* Tab Navigation */}
      <nav
        ref={navRef}
        role="tablist"
        aria-label="Dashboard Sections"
        className="position-relative d-flex flex-wrap justify-content-center gap-3 mb-5 border-bottom border-secondary pb-2"
        style={{ userSelect: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm rounded-pill fw-semibold text-nowrap px-4 py-2
                ${isActive ? 'btn-info shadow text-dark' : 'btn-outline-light text-light'}
                `}
              style={{
                transition: 'all 0.3s ease',
                boxShadow: isActive
                  ? '0 4px 12px rgb(14 240 255 / 0.6)'
                  : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                userSelect: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '1.2em',
                  marginRight: 6,
                  display: 'inline-block',
                  transform: 'translateY(1px)',
                }}
              >
                {tab.label.split(' ')[0]} {/* Keep emoji separate */}
              </span>
              <span>{tab.label.replace(/^[^\s]+\s/, '')}</span>
            </button>
          );
        })}

        {/* Sliding underline */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#0ef', // aqua accent
            transition: 'left 0.3s ease, width 0.3s ease',
            left: underlineStyle.left || 0,
            width: underlineStyle.width || 0,
          }}
        />
      </nav>

      {/* Tab Content */}
      <section
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="container flex-grow-1"
      >
        {activeTab === 'progress' && <ProgressTracker />}
        {activeTab === 'goals' && (
          <GoalsOverview initialGoals={profile?.goals || []} profile={profile} />
        )}
        {activeTab === 'pose' && <PoseTracer />}
        {activeTab === 'physique' && (
          <PhysiqueRating metrics={profile?.physiqueMetrics || {}} />
        )}
        {activeTab === 'chat' && <ChatWithCoach />}
        {activeTab === 'settings' && <Settings profile={profile} />}
      </section>
    </div>
  );
}
