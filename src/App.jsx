import 'bootstrap/dist/css/bootstrap.min.css'; 
import './index.css';
import React, { useState, useEffect } from 'react';
import OnboardingWrapper from './components/onboarding/OnboardingWrapper';
import Dashboard from './components/Dashboard';

function App() {
  const [completed, setCompleted] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('achapiUser');
    if (savedData) {
      setUserData(JSON.parse(savedData));
      setCompleted(true);
    }
  }, []);

  const handleOnboardingComplete = (data) => {
    setUserData(data);
    setCompleted(true);
    localStorage.setItem('achapiUser', JSON.stringify(data));
  };

  const handleReset = () => {
    localStorage.removeItem('achapiUser');
    setUserData(null);
    setCompleted(false);
  };

  if (completed && userData) {
    return (
      <>
        <Dashboard profile={userData} />
        <button
          onClick={handleReset}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '8px 16px',
            backgroundColor: '#f00',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Reset / Logout
        </button>
      </>
    );
  }

  return <OnboardingWrapper onComplete={handleOnboardingComplete} />;
}

export default App;
