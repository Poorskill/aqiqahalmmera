import { orderSteps, statusConfig } from '@/lib/statusConfig';

export function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentStepNum = statusConfig[currentStatus]?.stepNumber || 0;
  const totalSteps = orderSteps.length;
  const progressPercent = currentStatus === 'completed' ? 100 : Math.min(100, Math.round((currentStepNum / totalSteps) * 100));

  const currentStepObj = orderSteps.find((_, idx) => idx + 1 === currentStepNum);
  const nextStepObj = orderSteps.find((_, idx) => idx + 1 === currentStepNum + 1);

  return (
    <div className="almeera-card p-6 bg-white space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">Timeline Operasional & Tracking</h3>
          <p className="text-sm font-semibold text-stone-900 mt-0.5">
            Status Saat Ini: <span className="text-amber-600 font-bold">{statusConfig[currentStatus]?.label || currentStatus}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-lg border border-stone-200">
            Progress: {progressPercent}%
          </span>
          {nextStepObj && currentStatus !== 'completed' && (
            <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              Berikutnya: {nextStepObj.title}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {orderSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStepNum > stepNum || currentStatus === 'completed';
          const isCurrent = currentStatus === step.key;

          let badgeStyle = 'bg-stone-50 text-stone-400 border-stone-200';
          if (isCompleted) {
            badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
          } else if (isCurrent) {
            badgeStyle = 'bg-amber-600 text-white border-amber-600 shadow-sm font-semibold animate-pulse';
          }

          return (
            <div key={step.key} className={`p-3.5 rounded-xl border ${badgeStyle} flex flex-col justify-between transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold opacity-80">0{stepNum}</span>
                {isCompleted && <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>}
                {isCurrent && <span className="material-symbols-outlined text-sm text-white">schedule</span>}
              </div>
              <p className="text-xs font-medium">{step.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
