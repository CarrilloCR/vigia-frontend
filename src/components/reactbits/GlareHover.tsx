'use client'
import React from 'react';
import './GlareHover.css';

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = '100%',
  height = '100%',
  background = 'var(--glass)',
  borderRadius = '18px',
  borderColor = 'var(--border)',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.25,
  glareAngle = -45,
  glareSize = 200,
  transitionDuration = 600,
  playOnce = false,
  className = '',
  style = {},
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    rgba = `rgba(${r},${g},${b},${glareOpacity})`;
  }
  const vars = {
    '--gh-width': width, '--gh-height': height, '--gh-bg': background,
    '--gh-br': borderRadius, '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`, '--gh-size': `${glareSize}%`,
    '--gh-rgba': rgba, '--gh-border': borderColor,
  };
  return (
    <div
      className={`glare-hover ${playOnce ? 'glare-hover--play-once' : ''} ${className}`}
      style={{ ...vars, width, height, ...style } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
export default GlareHover;
