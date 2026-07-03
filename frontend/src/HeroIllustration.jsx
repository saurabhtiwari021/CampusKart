export default function HeroIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 440 460"
      className={className}
      role="img"
      aria-label="Illustration of a student browsing the marketplace on a laptop, surrounded by books, a price tag and a shopping bag"
    >
      <circle cx="220" cy="235" r="190" fill="var(--cream-deep)" />

      <ellipse cx="220" cy="402" rx="98" ry="14" fill="#181229" opacity="0.12" />

      {/* books stack */}
      <g stroke="#181229" strokeWidth="3" strokeLinejoin="round">
        <rect x="66" y="373" width="92" height="23" rx="5" fill="var(--coral)" transform="rotate(-3 112 384)" />
        <rect x="76" y="352" width="80" height="21" rx="5" fill="var(--teal)" transform="rotate(2 116 362)" />
        <rect x="84" y="332" width="66" height="20" rx="5" fill="var(--tangerine)" transform="rotate(-4 117 342)" />
      </g>

      {/* torso (hoodie silhouette doubling as arms) */}
      <path d="M150,345 Q148,238 176,224 Q220,202 264,224 Q292,238 290,345 Z" fill="var(--violet)" stroke="#181229" strokeWidth="3.5" strokeLinejoin="round" />

      {/* laptop */}
      <path d="M138,336 L302,336 L288,352 L152,352 Z" fill="var(--cream)" stroke="#181229" strokeWidth="3" strokeLinejoin="round" />
      <rect x="153" y="249" width="134" height="88" rx="8" fill="#ffffff" stroke="#181229" strokeWidth="3.5" />
      <line x1="153" y1="270" x2="287" y2="270" stroke="#181229" strokeWidth="2" />
      <g transform="translate(220,304)">
        <circle r="22" fill="var(--teal)" stroke="#181229" strokeWidth="3" />
        <path d="M-9,0 L-2,8 L11,-7" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* hands resting on the keyboard */}
      <circle cx="150" cy="338" r="14" fill="#F0B486" stroke="#181229" strokeWidth="3" />
      <circle cx="290" cy="338" r="14" fill="#F0B486" stroke="#181229" strokeWidth="3" />

      {/* head */}
      <circle cx="220" cy="188" r="41" fill="#F0B486" stroke="#181229" strokeWidth="3.5" />
      <path d="M180,187 Q177,144 220,142 Q263,144 260,187 Q220,158 180,187 Z" fill="#181229" />
      <circle cx="204" cy="192" r="3.4" fill="#181229" />
      <circle cx="236" cy="192" r="3.4" fill="#181229" />
      <path d="M204,205 Q220,216 236,205" fill="none" stroke="#181229" strokeWidth="3" strokeLinecap="round" />

      {/* floating price tag */}
      <g transform="translate(343,124) rotate(-16)">
        <g className="hero-illo-float-a">
          <ellipse cx="0" cy="46" rx="20" ry="5" fill="#181229" opacity="0.1" />
          <rect x="-27" y="-17" width="54" height="34" rx="7" fill="var(--yellow)" stroke="#181229" strokeWidth="3" />
          <circle cx="-14" cy="0" r="4" fill="var(--cream)" stroke="#181229" strokeWidth="2" />
          <text x="9" y="6" fontFamily="var(--font-display)" fontWeight="800" fontSize="16" fill="#181229" textAnchor="middle">₹</text>
        </g>
      </g>

      {/* shopping bag with a book poking out */}
      <g transform="translate(98,118) rotate(-9)">
        <g className="hero-illo-float-b">
          <ellipse cx="0" cy="42" rx="18" ry="5" fill="#181229" opacity="0.1" />
          <path d="M-14,-22 Q-14,-34 0,-34 Q14,-34 14,-22" fill="none" stroke="#181229" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="-20" y="-22" width="40" height="36" rx="6" fill="var(--coral)" stroke="#181229" strokeWidth="3.5" />
          <rect x="-10" y="-30" width="16" height="14" rx="2" fill="var(--cream)" stroke="#181229" strokeWidth="2.5" />
        </g>
      </g>

      {/* verified-seller stamp */}
      <g transform="translate(354,332) rotate(11)">
        <g className="hero-illo-float-a">
          <ellipse cx="0" cy="30" rx="16" ry="5" fill="#181229" opacity="0.1" />
          <circle r="26" fill="var(--teal)" stroke="#181229" strokeWidth="3" />
          <path d="M-10,0 L-3,8 L12,-8" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* floating coin */}
      <g transform="translate(58,318)">
        <g className="hero-illo-float-b">
          <ellipse cx="0" cy="26" rx="14" ry="4" fill="#181229" opacity="0.1" />
          <circle r="21" fill="var(--yellow)" stroke="#181229" strokeWidth="3" />
          <text y="6" fontFamily="var(--font-display)" fontWeight="800" fontSize="16" fill="#181229" textAnchor="middle">₹</text>
        </g>
      </g>

      {/* sparkle accents */}
      <path fill="var(--yellow)" transform="translate(64,208) scale(1.1)" d="M0,-11 C2,-3 3,-2 11,0 C3,2 2,3 0,11 C-2,3 -3,2 -11,0 C-3,-2 -2,-3 0,-11 Z" />
      <path fill="var(--violet)" transform="translate(388,258) scale(0.9)" d="M0,-11 C2,-3 3,-2 11,0 C3,2 2,3 0,11 C-2,3 -3,2 -11,0 C-3,-2 -2,-3 0,-11 Z" />
      <path fill="var(--coral)" transform="translate(258,58) scale(0.8)" d="M0,-11 C2,-3 3,-2 11,0 C3,2 2,3 0,11 C-2,3 -3,2 -11,0 C-3,-2 -2,-3 0,-11 Z" />
    </svg>
  );
}
