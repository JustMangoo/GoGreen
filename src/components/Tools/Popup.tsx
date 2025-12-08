import { X } from "lucide-react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  description: string;
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
}

export default function Popup({
  isOpen,
  onClose,
  heading,
  description,
  primaryAction,
  secondaryAction,
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
          <p className="py-4 text-sm text-base-content/70">{description}</p>

          {/* Action Buttons */}
          <div className="modal-action gap-2">
            <button
              onClick={secondaryAction.onClick}
              className={`btn ${secondaryButtonClass}`}
            >
              {secondaryAction.label}
            </button>
            <button
              onClick={primaryAction.onClick}
              className={`btn ${primaryButtonClass}`}
            >
              {primaryAction.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
