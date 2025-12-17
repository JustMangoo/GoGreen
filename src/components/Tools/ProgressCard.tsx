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
  loading?: boolean;
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
  loading = false,
}: ProgressCardProps) {
  const progressPercentage = progressMax === Infinity ? 100 : (progressCurrent / progressMax) * 100;

  return (
    <div className="card card-border border-base-300 bg-base-200 w-full max-w-md p-3 gap-4" style={{ height: showProgressBar ? '130px' : 'auto' }}>
      {loading ? (
        <>
          {/* Skeleton Header */}
          <div className="flex flex-row items-center gap-3">
            <div className={`flex justify-center items-center border-base-300 border-2 bg-base-100 text-primary rounded-box w-12 h-12 shrink-0`}><Icon /></div>
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <h2 className="skeleton-text text-sm text-base-content/60">{heading}</h2>
              <div className="skeleton h-5 w-32 rounded"></div>
            </div>
          </div>

          {/* Skeleton Progress Bar */}
          {showProgressBar && (
            <div>
              <div className="flex flex-row justify-between mb-1  text-sm ">
                <p className="skeleton-text text-base-content/60">{progressLabel}</p>
                <div className="skeleton h-3 w-10 rounded"></div>
              </div>
              <div className="skeleton h-2 w-full rounded-box"></div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-row items-center gap-3">
            <div
              className={`flex justify-center items-center border-base-300 border-2 bg-base-100 text-primary rounded-box w-12 h-12 shrink-0`}
            >
              <Icon />
            </div>
            <div className="flex flex-col items-baseline min-w-0">
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
        </>
      )}
    </div>
  );
}
