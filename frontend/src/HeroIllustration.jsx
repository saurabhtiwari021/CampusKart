const rise = (i) => ({ animationDelay: `${0.15 + i * 0.14}s` });

export default function HeroIllustration({ className = '' }) {
  const spokes = Array.from({ length: 16 }, (_, i) => (i * Math.PI) / 8);
  return (
    <svg
      viewBox="0 0 480 600"
      className={className}
      role="img"
      aria-label="A still life of stacked books, a bicycle wheel and a desk lamp on a plinth, framed by arches"
    >
      <defs>
        <clipPath id="ck-arch">
          <path d="M20 580V250a220 220 0 0 1 440 0v330z" />
        </clipPath>
      </defs>

      <g clipPath="url(#ck-arch)">
        <g className="art-rise" style={rise(0)}>
          <rect x="0" y="0" width="480" height="600" fill="var(--tone)" />
          <path d="M84 600V282a156 156 0 0 1 312 0v318z" fill="var(--tint)" />
          <path d="M140 600V300a100 100 0 0 1 200 0v300z" fill="#fff" opacity=".55" />
        </g>

        {/* sun */}
        <circle className="art-rise" style={rise(1)} cx="352" cy="150" r="42" fill="var(--paper)" />

        {/* plinth */}
        <g className="art-rise" style={rise(1)}>
          <rect x="0" y="498" width="480" height="102" fill="var(--cocoa)" />
          <rect x="0" y="498" width="480" height="3" fill="var(--tone-deep)" opacity=".5" />
        </g>

        {/* wheel */}
        <g className="art-rise" style={rise(2)}>
          <g transform="translate(286 418)" fill="none" stroke="var(--cocoa)">
            <circle r="80" strokeWidth="3.5" />
            <circle r="72" strokeWidth="1" opacity=".5" />
            {spokes.map((a, i) => (
              <line key={i} x1={Math.cos(a) * 10} y1={Math.sin(a) * 10} x2={Math.cos(a) * 72} y2={Math.sin(a) * 72} strokeWidth="1" />
            ))}
            <circle r="9" fill="var(--cocoa)" />
          </g>
        </g>

        {/* books */}
        <g className="art-rise" style={rise(3)}>
          <rect x="70" y="470" width="150" height="28" rx="3" fill="var(--sage-deep)" />
          <rect x="82" y="443" width="126" height="27" rx="3" fill="var(--paper)" />
          <rect x="96" y="417" width="104" height="26" rx="3" fill="var(--ochre)" />
          <rect x="70" y="482" width="150" height="2" fill="#fff" opacity=".35" />
          <rect x="82" y="456" width="126" height="2" fill="var(--tone-deep)" opacity=".7" />
        </g>

        {/* lamp */}
        <g className="art-rise" style={rise(4)}>
          <rect x="372" y="490" width="56" height="8" rx="4" fill="var(--paper)" />
          <path d="M400 490V352l-46-40" fill="none" stroke="var(--paper)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M328 292l52-18 26 46-52 12z" fill="var(--paper)" />
        </g>

        {/* tag */}
        <g className="art-rise" style={rise(5)} transform="translate(130 210) rotate(-14)">
          <path d="M0 0h58l16 17-16 17H0z" fill="var(--cocoa)" />
          <circle cx="60" cy="17" r="4" fill="var(--tint)" />
          <rect x="12" y="12" width="26" height="2.5" rx="1" fill="var(--tone)" />
          <rect x="12" y="20" width="18" height="2.5" rx="1" fill="var(--tone)" opacity=".6" />
        </g>
      </g>
    </svg>
  );
}
