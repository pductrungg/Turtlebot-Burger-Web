import { Button } from './ui/button';

interface ControlPanelProps {
  status: 'inactive' | 'active';
  mode: 'manual driving' | 'navigation';
  slamEnabled: 'yes' | 'no';
  onModeChange: (mode: 'manual driving' | 'navigation') => void;
  onSlamChange: (enabled: 'yes' | 'no') => void;
  onExportMap: () => void;
  onKillProcess: () => void;

  //NEW (for Set button)
  onSet: () => void;
  setDisabled?: boolean;
  setLabel?: string;
  killLabel?: string;
}

export function ControlPanel({
  status,
  mode,
  slamEnabled,
  onModeChange,
  onSlamChange,
  onExportMap,
  onKillProcess,
  onSet,
  setDisabled = false,
  setLabel = 'Set',
  killLabel = 'Kill Process',
}: ControlPanelProps) {
  const statusIsActive = status === 'active';

  return (
    <div className="border-2 border-black p-6 bg-slate-50 w-64 shadow-md">
      <div className="space-y-6">
        {/* Status (read-only) */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">Status</span>
          <span
            className={[
              'min-w-[84px] text-center px-3 py-1 rounded border-2 text-sm font-medium',
              statusIsActive
                ? 'bg-green-100 text-green-800 border-green-500'
                : 'bg-red-100 text-red-800 border-red-500',
            ].join(' ')}
          >
            {statusIsActive ? 'active' : 'inactive'}
          </span>
        </div>

        {/* Mode */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">Mode</span>
          <select
            value={mode}
            onChange={(e) =>
              onModeChange(e.target.value as 'manual driving' | 'navigation')
            }
            className="border-2 border-slate-400 bg-white rounded px-2 py-1 text-slate-900"
          >
            <option value="manual driving">manual driving</option>
            <option value="navigation">navigation</option>
          </select>
        </div>

        {/* SLAM */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">SLAM</span>
          <select
            value={slamEnabled}
            onChange={(e) => onSlamChange(e.target.value as 'yes' | 'no')}
            className="border-2 border-slate-400 bg-white rounded px-2 py-1 text-slate-900"
          >
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
        </div>

        {/* Export Map Button */}
        <div className="pt-4">
          <Button
            onClick={onExportMap}
            variant="outline"
            className="w-full border-2 border-black bg-white hover:bg-slate-800 hover:text-white"
          >
            export map
          </Button>
        </div>

        {/* Set + Kill Process */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-400">
          {/* Set button now wired */}
          <Button
            type="button"
            onClick={onSet}
            disabled={setDisabled}
            className="border-2 border-black bg-white hover:bg-slate-800 hover:text-white px-3 py-1 disabled:opacity-50"
          >
            {setLabel}
          </Button>

          {/* Kill process stays exactly the same */}
          <button
            onClick={onKillProcess}
            className="border-2 rounded-md border-black bg-white hover:bg-slate-800 hover:text-white px-3 py-1 disabled:opacity-50"
          >
            {killLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
