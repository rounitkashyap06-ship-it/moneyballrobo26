import React, { useState } from 'react';

interface TeamLogoProps {
  logo?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  name = 'Club',
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    custom: '',
  }[size];

  const isUrl =
    typeof logo === 'string' &&
    (logo.startsWith('http://') ||
      logo.startsWith('https://') ||
      logo.startsWith('/') ||
      logo.startsWith('data:'));

  if (isUrl && !hasError) {
    return (
      <img
        src={logo}
        alt={`${name} crest`}
        className={`object-contain flex-shrink-0 select-none ${sizeClasses} ${className}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  // If emoji or text
  if (logo && !isUrl) {
    return (
      <span className={`inline-flex items-center justify-center select-none ${sizeClasses} ${className}`}>
        {logo}
      </span>
    );
  }

  // Fallback badge with club initials
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`inline-flex items-center justify-center bg-black text-[#FFD600] font-heading font-black border border-black rounded-none ${sizeClasses} ${className}`}
      title={name}
    >
      <span className="text-[10px] leading-none">{initials}</span>
    </div>
  );
};
