import { X } from "lucide-react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  body: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction: {
    label: string;
    onClick: () => void;
  };
  primaryButtonClass?: string;
  secondaryButtonClass?: string;
  primaryButtonType?: "button" | "submit";
  secondaryButtonType?: "button" | "submit";
}

export default function Popup({
  isOpen,
  onClose,
  heading,
  body,
  primaryAction,
  secondaryAction,
  primaryButtonType = "button",
  secondaryButtonType = "button",
  primaryButtonClass = "btn-primary",
  secondaryButtonClass = "btn-outline",
}: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal modal-open">
        <div className="modal-box w-full max-w-sm">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <h3 className="font-bold text-lg">{heading}</h3>
          <div className="py-4 text-sm text-base-content/70">{body}</div>

          {/* Action Buttons */}
          <div className="modal-action gap-2">
            {secondaryAction && (
              <button
                type={secondaryButtonType ?? "button"}
                className={`btn ${secondaryButtonClass}`}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                type={primaryButtonType ?? "button"}
                className={`btn ${primaryButtonClass}`}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
