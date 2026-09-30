import { useState } from 'react';

/** Profile photo when there is one (e.g. from Google sign-in), otherwise the first initial. */
export default function Avatar({ user, size = 42, className = '', style }) {
  const [broken, setBroken] = useState(false);
  const name = user?.name || '?';
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.4), flexShrink: 0, ...style }}>
      {user?.picture && !broken
        ? <img src={user.picture} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
        : name[0]?.toUpperCase()}
    </span>
  );
}
