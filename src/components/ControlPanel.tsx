import { Button } from './ui/button';

interface ControlPanelProps {
  status: 'inactive' | 'active';
  mode: 'manual driving' | 'navigation';
  slamEnabled: 'yes' | 'no';
  onStatusChange: (status: 'inactive' | 'active') => void;
  onModeChange: (mode: 'manual driving' | 'navigation') => void;
  onSlamChange: (enabled: 'yes' | 'no') => void;
  onExportMap: () => void;
  onKillProcess: () => void;
}

export function ControlPanel({
  status,
  mode,
  slamEnabled,
  onStatusChange,
  onModeChange,
  onSlamChange,
  onExportMap,
  onKillProcess,
}: ControlPanelProps) {
  return (
    <div className="border-2 border-black p-6 bg-slate-50 w-64 shadow-md">
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">Status</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'inactive' | 'active')}
            className="border-2 border-slate-400 bg-white rounded px-2 py-1 text-slate-900"
          >
            <option value="inactive">inactive</option>
            <option value="active">active</option>
          </select>
        </div>

        {/* Mode */}
        <div className="flex items-center justify-between">
          <span className="text-slate-900">Mode</span>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as 'manual driving' | 'navigation')}
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

        {/* Kill Process */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-400">
          <span className="text-slate-900">Set</span>
          <button
            onClick={onKillProcess}
            className="text-slate-900 underline hover:text-black"
          >
            kill process
          </button>
        </div>
      </div>
    </div>
  );
}