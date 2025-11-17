import { Wifi, Power, Activity } from 'lucide-react';
import { Card } from './ui/card';

interface HeaderProps {
  totalDevices: number;
  onlineDevices: number;
  activeDevices: number;
}

export function Header({ totalDevices, onlineDevices, activeDevices }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-slate-900">Device Control Center</h1>
            <p className="text-slate-600 mt-1">Manage and monitor all your connected devices</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-600">Total Devices</p>
                  <p className="text-slate-900">{totalDevices}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-slate-600">Online</p>
                  <p className="text-slate-900">{onlineDevices}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Power className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-slate-600">Active</p>
                  <p className="text-slate-900">{activeDevices}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </header>
  );
}
