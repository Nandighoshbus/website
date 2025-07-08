/**
 * NANDIGHOSH COPYRIGHT WATERMARK COMPONENT
 * © 2025 NANDIGHOSH BUS SERVICE
 * UNAUTHORIZED COPYING PROHIBITED
 */

import React from 'react';

// Hidden watermark component that embeds copyright protection
export const NandighoshWatermark: React.FC = () => {
  return (
    <>
      {/* Invisible copyright markers */}
      <div 
        style={{ display: 'none' }}
        data-nandighosh-copyright="NANDIGHOSH_BUS_SERVICE_2025_PROTECTED"
        data-legal-warning="UNAUTHORIZED_COPYING_PROHIBITED_LEGAL_ACTION_WILL_BE_TAKEN"
      >
        {/* NANDIGHOSH_COPYRIGHT_2025_PROTECTED_SOFTWARE */}
      </div>
      
      {/* Hidden watermark text */}
      <span 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          opacity: 0,
          pointerEvents: 'none',
          fontSize: '1px',
          color: 'transparent'
        }}
        data-protection="active"
      >
        NANDIGHOSH BUS SERVICE COPYRIGHT 2025 PROTECTED SOFTWARE UNAUTHORIZED COPYING STRICTLY PROHIBITED
      </span>

      {/* Invisible SVG watermark */}
      <svg 
        width="1" 
        height="1" 
        style={{ position: 'absolute', left: '-1px', top: '-1px', opacity: 0 }}
        data-watermark="nandighosh-2025"
      >
        <text x="0" y="0" fontSize="1" fill="transparent">
          NANDIGHOSH_COPYRIGHT_2025_VIOLATION_TRACKING_ACTIVE
        </text>
      </svg>

      {/* Protection metadata */}
      <meta 
        name="nandighosh-protection" 
        content="active-copyright-2025" 
      />
    </>
  );
};

// Console watermark on component mount
React.useEffect(() => {
  console.log('%c⚠️ NANDIGHOSH WATERMARK ACTIVE ⚠️', 'color: #ea580c; font-weight: bold;');
}, []);

export default NandighoshWatermark;
