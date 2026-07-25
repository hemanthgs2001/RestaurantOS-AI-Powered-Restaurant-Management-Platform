import React from 'react';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const spinner = (
    <div style={{
      display: 'inline-block',
      width: spinnerSize,
      height: spinnerSize,
      border: '3px solid #E5E7EB',
      borderTop: '3px solid #4F46E5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        background: 'rgba(255,255,255,0.9)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      width: '100%'
    }}>
      {spinner}
    </div>
  );
};

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Loader;