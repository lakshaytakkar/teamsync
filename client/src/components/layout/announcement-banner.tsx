import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBannerProps {
  message?: string;
  linkText?: string;
  onAction?: () => void;
}

export function AnnouncementBanner({
  message = "NEW: TeamSync 2.0 is here — streamlined HR management with powerful new features!",
  linkText,
  onAction,
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("announcement-dismissed") === "true"; } catch { return false; }
  });

  if (dismissed) return null;

  return (
    <div
      className="relative flex w-full shrink-0 items-center justify-center bg-primary px-12 py-2.5 text-sm text-white"
      data-testid="announcement-banner"
    >
      <span className="font-medium text-center">{message}</span>
      {linkText && onAction && (
        <button
          onClick={onAction}
          className="ml-2 underline underline-offset-2 hover:opacity-80 font-semibold"
          data-testid="announcement-banner-link"
        >
          {linkText}
        </button>
      )}
      <button
        type="button"
        onClick={() => { setDismissed(true); try { sessionStorage.setItem("announcement-dismissed", "true"); } catch {} }}
        className="absolute right-3 flex items-center justify-center rounded p-1.5 hover:bg-white/15"
        aria-label="Dismiss announcement"
        data-testid="announcement-banner-close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
