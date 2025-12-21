import { Button } from './ui/button';

interface ControlPanelProps {
  status: 'Inactive' | 'Active';
  mode: 'manual driving' | 'navigation';
  slamEnabled: 'yes' | 'no';

  onModeChange: (mode: 'manual driving' | 'navigation') => void;
  onSlamChange: (enabled: 'yes' | 'no') => void;

  onExportMap: () => void;
  exportDisabled?: boolean;

  onKillProcess: () => void;

  onSet: () => void;
  setDisabled?: boolean;
  setLabel?: string;

  slamDisabled?: boolean;
}

export function ControlPanel({
  status,
  mode,
  slamEnabled,
  onModeChange,
  onSlamChange,
  onExportMap,
  exportDisabled = false,
  onKillProcess,
  onSet,
  setDisabled = false,
  // setLabel = 'set',
  slamDisabled = false,
}: ControlPanelProps) {
  return (
    <div className="border-2 border-black p-6 bg-slate-50 w-64 shadow-md">
      <div className="space-y-6">
        {/* Status (read-only) */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">Status</span>
          <span
            className={`px-2 py-1 border-2 rounded border-black ${
              status === 'Active' ? '' : 'bg-slate-200'
            }`}
            style={{
              backgroundColor: status === 'Active' ? '#16a34a' : '#dc2626', // green-600 / red-600
              color: '#ffffff',              
            }}
          >
            {status}
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
            <option value="manual driving">Manual Driving</option>
            <option value="navigation">Navigation</option>
          </select>
        </div>

        {/* SLAM */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">SLAM Activate</span>
          <select
            value={slamEnabled}
            onChange={(e) => onSlamChange(e.target.value as 'yes' | 'no')}
            disabled={slamDisabled}
            className="border-2 border-slate-400 bg-white rounded px-2 py-1 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onExportMap}
          disabled={exportDisabled}
          className="w-full border-2 border-black bg-white hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Map
        </Button>

        {/* Set + Kill Process */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-400">
          {/* Set button now wired */}
          <Button
            type="button"
            onClick={onSet}
            disabled={setDisabled}
            className="border-2 border-black bg-white hover:bg-slate-800 hover:text-white px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set
          </Button>

          {/* Kill process stays exactly the same */}
          <button
            type="button"
            onClick={onKillProcess}
            className="border-2 rounded-md border-black bg-white hover:bg-slate-800 hover:text-white px-3 py-1"
          >
            Kill Process
          </button>
        </div>
      </div>
    </div>
  );
}
