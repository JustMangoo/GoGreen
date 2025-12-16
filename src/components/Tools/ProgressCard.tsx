import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ProgressCardProps = {
  icon: LucideIcon;
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
  heading,
  subheading = "",
  progressLabel,
  progressCurrent = 0,
  progressMax = 100,
  showProgressBar = false,
  children,
}: ProgressCardProps) {
  const progressPercentage = (progressCurrent / progressMax) * 100;

  return (
    <div className="card card-border border-base-300 bg-base-200 w-full max-w-md p-3 gap-4">
      {/* Header */}
      <div className="flex flex-row items-center gap-3">
        <div
          className={`flex justify-center items-center border-base-300 border-2 bg-base-100 text-primary rounded-box w-12 h-12`}
        >
          <Icon />
        </div>
        <div className="flex flex-col items-baseline">
          <h2 className="text-sm text-base-content/60">{heading}</h2>
          <p className="font-semibold text-lg">{subheading}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div>
          <div className="flex flex-row justify-between text-sm mb-1">
            <p className="text-base-content/60">{progressLabel}</p>
            <p className="font-medium">
              {progressCurrent}/{progressMax === Infinity ? '∞' : progressMax}
            </p>
          </div>
          <div className="flex h-2 bg-base-300 rounded-box overflow-hidden">
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
