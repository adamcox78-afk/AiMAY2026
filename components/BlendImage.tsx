'use client';

import { useState } from 'react';

/**
 * Renders a Higgsfield-generated asset with seamless blended edges.
 * If the asset is missing (skill not yet run), it stays invisible so the
 * underlying live Canvas/CSS visual carries the scene — no broken boxes ever.
 */
export default function BlendImage({
  src,
  alt,
  className = '',
  variant = 'image',
}: {
  src: string;
  alt: string;
  className?: string;
  variant?: 'image' | 'device' | 'soft';
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  const blendClass =
    variant === 'device'
      ? 'blend-device'
      : variant === 'soft'
        ? 'blend-soft'
        : 'blend-image';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${blendClass} ${className} transition-opacity duration-1000 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
