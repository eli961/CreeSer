type IconProps = { className?: string };

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" } as const;

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg {...base} width={18} height={18} strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg {...base} width={18} height={18} strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} width={22} height={22} strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.6} className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21l2.3-7.4-6-4.6h7.6z" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z" />
    </svg>
  );
}

export function IconBook({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M12 2v8M12 22c-3 0-5-2-5-5 0-2.5 2-4.5 5-7 3 2.5 5 4.5 5 7 0 3-2 5-5 5z" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg {...base} width={26} height={26} strokeWidth={1.6} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

export function IconWhatsApp({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5a8.38 8.38 0 0 1-1-4A8.5 8.5 0 0 1 11.5 2 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  );
}

export function IconYouTube({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <path d="M22 8.6a3 3 0 0 0-2-2C18 6 12 6 12 6s-6 0-8 .6a3 3 0 0 0-2 2A31 31 0 0 0 2 12a31 31 0 0 0 0 3.4 3 3 0 0 0 2 2C6 18 12 18 12 18s6 0 8-.6a3 3 0 0 0 2-2 31 31 0 0 0 0-3.4 31 31 0 0 0 0-3.4z" />
      <path d="M10 15l5-3-5-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.75} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
