import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt } from '@fortawesome/free-solid-svg-icons';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-container">
        <div className="announcement-content">
          <FontAwesomeIcon icon={faPhoneAlt} />
          Need help? Call us at <a href="tel:5743438522">(574) 343-8522</a>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
