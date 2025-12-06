import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ProgressCardProps = {
  icon: LucideIcon;
  iconBgColor?: string;
  heading: string;
  subheading: string;
  progressLabel?: string;
  progressCurrent?: number;
  progressMax?: number;
  showProgressBar?: boolean;
  children?: ReactNode;
};

export default function ProgressCard({
  icon: Icon,
  iconBgColor = "bg-primary",
  heading,
  subheading,
  progressLabel,
  progressCurrent = 0,
  progressMax = 100,
  showProgressBar = false,
  children,
}: ProgressCardProps) {
  const progressPercentage = (progressCurrent / progressMax) * 100;

  return (
    <div className="card card-border bg-base-100 w-full max-w-md p-3 space-y-4">
      {/* Header */}
      <div className="flex flex-row items-center gap-3">
        <div
          className={`flex justify-center items-center ${iconBgColor} text-white rounded-box w-12 h-12`}
        >
          <Icon />
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-base-content/60">{heading}</p>
          <p className="font-semibold text-lg">{subheading}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div>
          <div className="flex flex-row justify-between text-sm mb-1">
            <p className="text-base-content/60">{progressLabel}</p>
            <p className="font-medium">
              {progressCurrent}/{progressMax}
            </p>
          </div>
          <div className="flex h-2 bg-base-200 rounded-box overflow-hidden">
            <div
              className="bg-primary h-full rounded-box transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Custom Content */}
      {children}
    </div>
  );
}
