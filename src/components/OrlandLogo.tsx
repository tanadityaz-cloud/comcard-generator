import React from 'react';

interface OrlandLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'gold' | 'dark' | 'light';
}

export const OrlandLogo: React.FC<OrlandLogoProps> = ({
  className = '',
  width = '100%',
  height = 'auto',
  variant = 'gold',
}) => {
  // Color palette definitions based on variant
  const isDark = variant === 'dark';
  const isLight = variant === 'light';

  return (
    <svg
      viewBox="0 0 500 240"
      width={width}
      height={height}
      className={`overflow-visible drop-shadow-sm ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Gold Gradient */}
        <linearGradient id="orlandGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9E8A2" />
          <stop offset="30%" stopColor="#D4A737" />
          <stop offset="60%" stopColor="#FFF2BF" />
          <stop offset="85%" stopColor="#B3811B" />
          <stop offset="100%" stopColor="#D4A737" />
        </linearGradient>

        <linearGradient id="orlandGoldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFAEA" />
          <stop offset="40%" stopColor="#E6B83B" />
          <stop offset="80%" stopColor="#996B00" />
          <stop offset="100%" stopColor="#D4A737" />
        </linearGradient>

        {/* Drop Shadow Filter for Luxury Depth */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#goldGlow)">
        {/* Sparkles / Four-Point Stars */}
        <g fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'}>
          {/* Top Star */}
          <path d="M 370,25 Q 370,35 380,35 Q 370,35 370,45 Q 370,35 360,35 Q 370,35 370,25 Z" />
          {/* Small Left Star */}
          <path d="M 352,48 Q 352,54 358,54 Q 352,54 352,60 Q 352,54 346,54 Q 352,54 352,48 Z" />
          {/* Small Right Star */}
          <path d="M 436,48 Q 436,54 442,54 Q 436,54 436,60 Q 436,54 430,54 Q 436,54 436,48 Z" />
        </g>

        {/* Film Clapperboard Icon */}
        <g transform="translate(355, 38) rotate(-18) scale(0.75)" fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'} stroke="#171717" strokeWidth="1.5">
          {/* Top Clapper Handle */}
          <path d="M 0,0 L 50,0 L 45,10 L -5,10 Z" />
          <path d="M -2,-12 L 48,-12 L 45,-2 L -5,-2 Z" />
          {/* Clapper Stripes */}
          <line x1="8" y1="-12" x2="3" y2="-2" stroke="#171717" strokeWidth="3" />
          <line x1="22" y1="-12" x2="17" y2="-2" stroke="#171717" strokeWidth="3" />
          <line x1="36" y1="-12" x2="31" y2="-2" stroke="#171717" strokeWidth="3" />
          {/* Main Board Body */}
          <rect x="-5" y="10" width="55" height="32" rx="3" fill={isDark ? '#2A2A2A' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'} />
          {/* Board Lines */}
          <rect x="2" y="15" width="10" height="7" fill="#171717" />
          <rect x="15" y="15" width="10" height="7" fill="#171717" />
          <rect x="28" y="15" width="10" height="7" fill="#171717" />
        </g>

        {/* Film Reel Icon */}
        <g transform="translate(415, 80) scale(0.65)" fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'} stroke="#171717" strokeWidth="2">
          {/* Outer Reel Circle */}
          <circle cx="25" cy="25" r="24" />
          <circle cx="25" cy="25" r="20" fill="none" stroke="#171717" strokeWidth="1.5" />
          {/* Reel Holes */}
          <circle cx="25" cy="13" r="5" fill="#171717" />
          <circle cx="25" cy="37" r="5" fill="#171717" />
          <circle cx="13" cy="25" r="5" fill="#171717" />
          <circle cx="37" cy="25" r="5" fill="#171717" />
          <circle cx="25" cy="25" r="4" fill="#171717" />
        </g>

        {/* Flowing Script Text "Orland" */}
        <g stroke="#171717" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
          <text
            x="40"
            y="125"
            fontFamily="'Playfair Display', 'Baskerville', 'Great Vibes', 'Georgia', serif"
            fontSize="102"
            fontWeight="bold"
            fontStyle="italic"
            fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldTextGrad)'}
            letterSpacing="-1"
          >
            Orland
          </text>
        </g>

        {/* Dynamic Flourish Underline Ribbon */}
        <path
          d="M 90,145 Q 160,152 240,148 T 430,135 Q 360,158 200,165 Q 110,169 90,145 Z"
          fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'}
          stroke="#171717"
          strokeWidth="1.5"
        />

        {/* All-Caps Sub-text "MANAGEMENT" */}
        <g stroke="#171717" strokeWidth="1.5" strokeLinejoin="round">
          <text
            x="135"
            y="198"
            fontFamily="'Cinzel', 'Montserrat', 'Helvetica', sans-serif"
            fontSize="30"
            fontWeight="900"
            letterSpacing="6"
            fill={isDark ? '#171717' : isLight ? '#FFFFFF' : 'url(#orlandGoldGrad)'}
          >
            MANAGEMENT
          </text>
        </g>
      </g>
    </svg>
  );
};
