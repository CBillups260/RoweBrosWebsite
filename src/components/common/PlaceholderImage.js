import React from 'react';

const PlaceholderImage = ({ alt, className }) => {
  return (
    <div className={`placeholder-image ${className || ''}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 400 300" 
        width="100%" 
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="100%" height="100%" fill="#cccccc" />
        <g fill="#ffffff">
          <polygon points="150,150 250,250 50,250" />
          <polygon points="200,120 300,250 100,250" />
          <circle cx="300" cy="100" r="30" />
          <circle cx="80" cy="80" r="20" />
        </g>
      </svg>
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
};

export default PlaceholderImage;
