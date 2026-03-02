interface VendorPortalLogoProps {
  size?: number;
  className?: string;
}

export function VendorPortalLogo({ size = 36, className }: VendorPortalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#7C3AED" />
      <text
        x="18"
        y="25"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="white"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.5"
      >VP</text>
    </svg>
  );
}
