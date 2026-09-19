export function PosyanduLogo({
  className = "h-10 w-10",
  showText = false,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <svg
        className={className}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Posyandu Kedungrejo"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="logoLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outer Shield with Soft Radius */}
        <rect x="4" y="4" width="112" height="112" rx="26" fill="url(#logoBgGrad)" />
        <rect
          x="5" y="5" width="110" height="110" rx="25"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />

        {/* Soft Background Rays / Rings */}
        <circle cx="60" cy="60" r="44" fill="white" fillOpacity="0.04" />
        <circle cx="60" cy="60" r="32" fill="white" fillOpacity="0.05" />

        {/* Embracing Hands of Care (Kemenkes / Posyandu Motif) */}
        <path
          d="M26 68 C26 86 42 96 60 96 C78 96 94 86 94 68 C94 58 86 50 80 54 C74 58 77 69 75 74 C71 82 49 82 45 74 C43 69 46 58 40 54 C34 50 26 58 26 68 Z"
          fill="url(#logoLeafGrad)"
        />

        {/* Mother Figure (White) */}
        <circle cx="50" cy="40" r="8.5" fill="#ffffff" filter="url(#logoShadow)" />
        <path
          d="M39 63 C39 49 61 49 61 63 C61 69 39 69 39 63 Z"
          fill="#ffffff"
          filter="url(#logoShadow)"
        />

        {/* Baby / Child in Warm Embrace (Sky Blue) */}
        <circle cx="69" cy="48" r="6.5" fill="#7dd3fc" />
        <path
          d="M61 66 C61 56 75 56 75 66 C75 71 61 71 61 66 Z"
          fill="#7dd3fc"
        />

        {/* Vital Sign ECG Pulse Track */}
        <path
          d="M28 84 L45 84 L49 76 L53 88 L57 80 L61 86 L65 84 L92 84"
          stroke="#ffffff"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Medical Cross Accent */}
        <path
          d="M86 28 H94 M90 24 V32"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              Posyandu Kedungrejo
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Database Online
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Registri Vital Sign Balita • Kecamatan Jabon
          </p>
        </div>
      )}
    </div>
  );
}
