import React from 'react';
import { soundEffects } from '../utils/audio.ts';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  leftIcon,
  rightIcon,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEffects.playClick();
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FFD600] text-black hover:bg-[#FFEE55]';
      case 'secondary':
        return 'bg-[#3D5AFE] text-white hover:bg-[#536DFE]';
      case 'amber':
        return 'bg-[#FF6D00] text-black hover:bg-[#FF9100]';
      case 'danger':
        return 'bg-[#FF5CA8] text-black hover:bg-[#FF77B8]';
      case 'lime':
        return 'bg-[#B6FF3B] text-black hover:bg-[#CAFF5E]';
      case 'ghost':
        return 'bg-[#FFFFFF] text-black hover:bg-[#FFF8E7]';
      default:
        return 'bg-[#FFD600] text-black';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-7 py-3.5 text-base font-black';
      default:
        return 'px-5 py-2.5 text-sm';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 border-[3px] border-black shadow-[4px_4px_0_#000] rounded-[2px] font-mono font-bold uppercase tracking-wider transition-all duration-75 cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0_#000] ${getVariantStyles()} ${getSizeStyles()} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="truncate">{title}</span>
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
