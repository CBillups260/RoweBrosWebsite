import React from 'react';
import '../../styles/loading-spinner.css';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const spinnerSize = size === 'small' ? 'spinner-small' : 
                     size === 'large' ? 'spinner-large' : 'spinner-medium';
  
  return (
    <div className="spinner-container">
      <div className={`spinner ${spinnerSize}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
