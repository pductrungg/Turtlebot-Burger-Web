// src/components/Module.tsx

type ModuleStatus = 'Disabled' | 'Enabled';

interface ModuleProps {
  bringupStatus: ModuleStatus;
  cartographerStatus: ModuleStatus;
  navigationStatus: ModuleStatus;
  batteryPercentage?: number; // Optional battery percentage (0-100)

  linearVelocity?: number;   // cm/s
  angularVelocity?: number;  // cm/s  
}

export function Module({ 
  bringupStatus,
  cartographerStatus,
  navigationStatus,
  batteryPercentage,
  linearVelocity,
  angularVelocity,
}: ModuleProps) {
  const getBatteryColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBatteryTextColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-700';
    if (percentage >= 40) return 'text-yellow-700';
    if (percentage >= 20) return 'text-orange-700';
    return 'text-red-700';
  };

  const getBatteryIcon = (percentage: number) => {
    if (percentage >= 90) return '🔋';
    if (percentage >= 60) return '🔋';
    if (percentage >= 30) return '🪫';
    return '🪫';
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border-2 border-black">
      {/* <h3 className="text-lg font-bold text-gray-800 mb-3">Module</h3> */}     
      <div className="space-y-4">
        {/* Bringup Module */}
        <div className="flex items-center justify-between" style={{marginBottom: '20px'}}>
          <span className="text-slate-900">Bringup</span>
          <span
            className="min-w-[84px] text-center px-3 py-1 rounded border-black border-2 text-sm font-semibold"
            style={{
              backgroundColor: bringupStatus === 'Enabled' ? '#16a34a' : '#dc2626', // green-600 / red-600
              color: '#ffffff',
              textAlign: 'center',
              minWidth: '80px',
            }}
          >
            {bringupStatus}
          </span>
        </div>
        
        {/* Cartographer Module */}
        <div className="flex items-center justify-between" style={{marginBottom: '20px'}}>
          <span className="text-slate-900">Cartographer</span>
          <span
            className="min-w-[84px] text-center px-3 py-1 rounded border-black border-2 text-sm font-semibold"
            style={{
              backgroundColor: cartographerStatus === 'Enabled' ? '#16a34a' : '#dc2626', // green-600 / red-600
              color: '#ffffff',
              textAlign: 'center',
              minWidth: '80px',
            }}
          >
            {cartographerStatus}
          </span>
        </div>
        
        {/* Navigation Module */}
        <div className="flex items-center justify-between" style={{marginBottom: '20px'}}>
          <span className="text-slate-900">Navigation</span>
          <span
            className="min-w-[84px] text-center px-3 py-1 rounded border-black border-2 text-sm font-semibold"
            style={{
              backgroundColor: navigationStatus === 'Enabled' ? '#16a34a' : '#dc2626', // green-600 / red-600
              color: '#ffffff',
              textAlign: 'center',
              minWidth: '80px',              
            }}
          >
            {navigationStatus}
          </span>
        </div>
      </div>

      {/* Battery Status Section */}
      <div className="pt-4 border-t-2 border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-900 font-medium">Battery</span>
          {batteryPercentage !== undefined ? (
            <span className={`font-bold ${getBatteryTextColor(batteryPercentage)}`}>
              {batteryPercentage}%
            </span>
          ) : (
            <span className="text-gray-500 font-medium">N/A</span>
          )}
        </div>
        
        {batteryPercentage !== undefined && (
          <>
            {/* Battery Icon */}
            {/* <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">{getBatteryIcon(batteryPercentage)}</span>
            </div> */}
            
            {/* Battery Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${getBatteryColor(batteryPercentage)} transition-all duration-300`}
                style={{ width: `${Math.max(5, Math.min(100, batteryPercentage))}%` }}
              />
            </div>
            
            {/* Battery Status Text */}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-medium ${getBatteryTextColor(batteryPercentage)}`}>
                {batteryPercentage >= 75 ? 'Good' : 
                batteryPercentage >= 40 ? 'Fair' : 
                batteryPercentage >= 20 ? 'Low' : 'Critical'}
              </span>

              <span className="text-lg">
                {getBatteryIcon(batteryPercentage)}
              </span>
            </div>
            {/* Velocity Section */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 text-sm font-medium">
                  Linear Velocity
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {(linearVelocity ?? 0).toFixed(1)} cm/s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-900 text-sm font-medium">
                  Angular Velocity
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {(angularVelocity ?? 0).toFixed(1)} cm/s
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* {batteryPercentage === undefined && (
          <div className="text-center py-3 bg-gray-100 rounded-lg">
            <span className="text-gray-500 text-sm">Battery data not available</span>
          </div>
        )} */}
      </div>
    </div>
  );
}