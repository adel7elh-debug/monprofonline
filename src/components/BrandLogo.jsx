import { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function BrandLogo({ className = '', imageClassName = 'h-16 w-auto', fallbackClassName = '' }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src="/images/logo-monprof.png"
        alt="MonProf Online"
        width="425"
        height="222"
        decoding="async"
        className={`object-contain ${imageClassName} ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`flex items-center gap-2 font-black text-navy ${fallbackClassName || className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-royal text-white">
        <GraduationCap className="h-6 w-6" />
      </span>
      <span>MonProf Online</span>
    </span>
  );
}
