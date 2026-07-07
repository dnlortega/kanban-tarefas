interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#6366f1" />
      <rect x="7" y="17" width="5" height="9" rx="1.5" fill="white" />
      <rect x="13.5" y="11" width="5" height="15" rx="1.5" fill="white" fillOpacity="0.92" />
      <rect x="20" y="7" width="5" height="19" rx="1.5" fill="white" fillOpacity="0.8" />
    </svg>
  );
}
