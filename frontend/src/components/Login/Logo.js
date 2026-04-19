import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ size = 'large' }) => {
  const sizes = {
    small: { width: 120, height: 60 },
    medium: { width: 160, height: 80 },
    large: { width: 200, height: 100 },
  };

  const currentSize = sizes[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        padding: 2,
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        width: currentSize.width,
        height: currentSize.width, // make it square/circular container
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/5rings-logo.png`}
        alt="5Rings Sport Platform"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback to inline SVG if image fails to load
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 500 300" style="max-width: 100%;">
              <rect width="500" height="300" fill="transparent"/>
              <text x="250" y="200" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">
                <tspan font-size="80">5</tspan>RINGS
              </text>
              <circle cx="180" cy="130" r="20" fill="none" stroke="white" stroke-width="6"/>
              <circle cx="290" cy="150" r="25" fill="#4CAF50" stroke="#4CAF50" stroke-width="6"/>
            </svg>
          `;
        }}
      />
    </Box>
  );
};

export default Logo;
