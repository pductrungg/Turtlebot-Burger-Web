import { useState } from 'react';
import { ControlPanel } from './ControlPanel';
import { DirectionalPad } from './DirectionalPad';
import { SlamMap } from './SlamMap';

export function MainTab() {
  const [status, setStatus] = useState<'inactive' | 'active'>('inactive');
  const [mode, setMode] = useState<'manual driving' | 'navigation'>('manual driving');
  const [slamEnabled, setSlamEnabled] = useState<'yes' | 'no'>('no');

  const handleExportMap = () => {
    console.log('Exporting map...');
    alert('Map exported successfully');
  };

  const handleKillProcess = () => {
    console.log('Killing process...');
    if (confirm('Are you sure you want to kill the process?')) {
      setStatus('inactive');
      alert('Process killed');
    }
  };

  const handleDirectionClick = (direction: 'up' | 'down' | 'left' | 'right' | 'stop') => {
    console.log(`Direction: ${direction}`);
    // Here you would send the command to the robot
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100">
      {/* Main Content Area */}
      <div className="flex-1 flex border-b-2 border-black overflow-hidden">
        {/* Left Side - 1/3 */}
        <div className="w-1/3 flex flex-col gap-4 p-4">
          <ControlPanel
            status={status}
            mode={mode}
            slamEnabled={slamEnabled}
            onStatusChange={setStatus}
            onModeChange={setMode}
            onSlamChange={setSlamEnabled}
            onExportMap={handleExportMap}
            onKillProcess={handleKillProcess}
          />
          
          <DirectionalPad onDirectionClick={handleDirectionClick} />
        </div>

        {/* Right Side - 2/3 - SLAM Map */}
        <div className="w-2/3 p-4 flex">
          <SlamMap/>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="h-24 border-b-2 border-black p-4 bg-slate-200">
        <p className="text-slate-700">Console output / Logs</p>
      </div>
    </div>
  );
}