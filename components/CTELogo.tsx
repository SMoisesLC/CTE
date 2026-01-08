
import React from 'react';

export const CTELogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 110 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <text 
      x="55" 
      y="42" 
      fontFamily="'Arial', 'Inter', sans-serif" 
      fontWeight="900" 
      fontSize="52" 
      fill="#F59E0B"
      textAnchor="middle"
      letterSpacing="-2"
      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}
    >
      CTE
    </text>
  </svg>
);
