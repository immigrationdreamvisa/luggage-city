import React from 'react';
import logoDark from '../assets/images/logo-dark.png';
import logoLight from '../assets/images/logo-light.png';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  className?: string;
  imgClassName?: string;
}

export function BrandLogo({ variant = 'dark', className = '', imgClassName = '' }: BrandLogoProps) {
  const isLight = variant === 'light';
  const logoSrc = isLight ? logoLight : logoDark;

  return (
    <span className={`inline-flex items-center whitespace-nowrap shrink-0 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Luggage City Superstore"
        className={`h-9 sm:h-10 md:h-12 w-auto max-w-[220px] sm:max-w-[260px] md:max-w-[290px] object-contain transition-all ${imgClassName}`}
        loading="eager"
      />
    </span>
  );
}

