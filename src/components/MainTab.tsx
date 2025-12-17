// src/components/MainTab.tsx
import { useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';
import { ControlPanel } from './ControlPanel';
import { DirectionalPad } from './DirectionalPad';
import { SlamMap } from './SlamMap';
import { Module } from './Module';

type Status = 'inactive' | 'active';
type Mode = 'manual driving' | 'navigation';
type SlamEnabled = 'yes' | 'no';
type ModuleStatus = 'disabled' | 'enabled';

export function MainTab() {
  const [status, setStatus] = useState<Status>('inactive');
  const [mode, setMode] = useState<Mode>('manual driving');
  const [slamEnabled, setSlamEnabled] = useState<SlamEnabled>('no');

  // "bringup done" flag for enabling the pad
  const [robotStarted, setRobotStarted] = useState(false);
  const [starting, setStarting] = useState(false);

  // Module status states
  const [bringupStatus, setBringupStatus] = useState<ModuleStatus>('disabled');
  const [cartographerStatus, setCartographerStatus] = useState<ModuleStatus>('disabled');
  const [navigationStatus, setNavigationStatus] = useState<ModuleStatus>('disabled');

  // Battery state
  const [batteryPercentage, setBatteryPercentage] = useState<number | undefined>(undefined);

  // ROS connection + topics/services
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const cmdVelRef = useRef<ROSLIB.Topic<any> | null>(null);
  const startRobotSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const stopRobotSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const startSlamSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const batteryTopicRef = useRef<ROSLIB.Topic<any> | null>(null);

  // Connect to rosbridge when MainTab mounts
  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://172.20.10.2:9090',
    });

    ros.on('connection', () => {
      console.log('Connected to rosbridge');
      setStatus('active');
      
      // Subscribe to battery topic when connected
      if (rosRef.current) {
        // Try common battery topics for TurtleBot3
        const batteryTopics = [
          '/battery_state',
          '/battery',
          '/power_supply',
          '/diagnostics'
        ];
        
        // Try each topic
        batteryTopics.forEach(topicName => {
          try {
            const batteryTopic = new ROSLIB.Topic({
              ros: rosRef.current!,
              name: topicName,
              messageType: 'sensor_msgs/BatteryState', // Common message type
            });
            
            batteryTopic.subscribe((message: any) => {
              console.log('Battery message received:', message);
              
              // Extract battery percentage from different possible message formats
              let percentage: number | undefined;
              
              // Method 1: Direct percentage field (common in BatteryState)
              if (message.percentage !== undefined) {
                percentage = Math.round(message.percentage * 100);
              }
              // Method 2: Voltage-based calculation (for TurtleBot3)
              else if (message.voltage !== undefined) {
                // TurtleBot3 battery: 11.1V nominal, 12.6V full, 9.9V empty
                const voltage = message.voltage;
                const maxVoltage = 12.6;
                const minVoltage = 9.9;
                const clampedVoltage = Math.min(maxVoltage, Math.max(minVoltage, voltage));
                percentage = Math.round(((clampedVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100);
              }
              // Method 3: From diagnostics message
              else if (message.status && Array.isArray(message.status)) {
                const batteryStatus = message.status.find((s: any) => 
                  s.name?.toLowerCase().includes('battery') || 
                  s.message?.toLowerCase().includes('battery')
                );
                if (batteryStatus && batteryStatus.values) {
                  const voltageValue = batteryStatus.values.find((v: any) => 
                    v.key.toLowerCase().includes('voltage')
                  );
                  if (voltageValue) {
                    const voltage = parseFloat(voltageValue.value);
                    const maxVoltage = 12.6;
                    const minVoltage = 9.9;
                    const clampedVoltage = Math.min(maxVoltage, Math.max(minVoltage, voltage));
                    percentage = Math.round(((clampedVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100);
                  }
                }
              }
              
              if (percentage !== undefined) {
                setBatteryPercentage(percentage);
              }
            });
            
            batteryTopicRef.current = batteryTopic;
            console.log(`Subscribed to battery topic: ${topicName}`);
            return; // Stop after first successful subscription
          } catch (error) {
            console.log(`Failed to subscribe to ${topicName}:`, error);
          }
        });
      }
    });

    ros.on('error', (error) => {
      console.error('Error connecting to rosbridge:', error);
      setStatus('inactive');
      setRobotStarted(false);
      // Reset all modules on error
      setBringupStatus('disabled');
      setCartographerStatus('disabled');
      setNavigationStatus('disabled');
    });

    ros.on('close', () => {
      console.log('Disconnected from rosbridge');
      setStatus('inactive');
      setRobotStarted(false);
      // Reset all modules on disconnect
      setBringupStatus('disabled');
      setCartographerStatus('disabled');
      setNavigationStatus('disabled');
    });

    const cmdVel = new ROSLIB.Topic({
      ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    const startRobotSrv = new ROSLIB.Service({
      ros,
      name: '/start_robot',
      serviceType: 'std_srvs/Trigger',
    });

    stopRobotSrvRef.current = new ROSLIB.Service({
      ros,
      name: '/stop_robot',
      serviceType: 'std_srvs/Trigger',
    }); 
    
    startSlamSrvRef.current = new ROSLIB.Service({
      ros,
      name: '/start_slam',
      serviceType: 'std_srvs/Trigger',
    });

    rosRef.current = ros;
    cmdVelRef.current = cmdVel;
    startRobotSrvRef.current = startRobotSrv;

    return () => {
      try {
        cmdVel.unsubscribe();
      } catch {}
      try {
        if (batteryTopicRef.current) {
          batteryTopicRef.current.unsubscribe();
        }
      } catch {}
      try {
        ros.close();
      } catch {}
    };
  }, []);

  // Simulated battery updates for testing (if no ROS data available)
  useEffect(() => {
    if (status === 'active' && batteryPercentage === undefined) {
      // Simulate battery data for testing
      const interval = setInterval(() => {
        // Simulate random battery drain for demo
        const simulatedBattery = Math.max(20, Math.floor(Math.random() * 100));
        setBatteryPercentage(simulatedBattery);
      }, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [status, batteryPercentage]);

  // Optional: periodic "status check" (ping-like) via websocket open/close
  useEffect(() => {
    const robotURL = 'ws://172.20.10.2:9090';

    const checkRobotStatus = () => {
      let opened = false;
      const ws = new WebSocket(robotURL);

      const markInactiveIfNotOpened = () => {
        if (!opened) {
          setStatus('inactive');
          setRobotStarted(false);
        }
      };

      ws.onopen = () => {
        opened = true;
        setStatus('active');
        ws.close();
      };

      ws.onerror = markInactiveIfNotOpened;
      ws.onclose = markInactiveIfNotOpened;
    };

    checkRobotStatus();
    const intervalId = setInterval(checkRobotStatus, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleExportMap = () => {
    console.log('Exporting map...');
    alert('Map exported successfully (stub – implement later)');
  };

  const handleKillProcess = () => {
    if (status !== 'active' || !stopRobotSrvRef.current) {
      alert('Not connected to rosbridge yet.');
      return;
    }

    setStarting(true);

    stopRobotSrvRef.current.callService({} as any, (res: any) => {
      setStarting(false);

      if (res?.success) {
        setRobotStarted(false);
        // Reset all modules to disabled
        setBringupStatus('disabled');
        setCartographerStatus('disabled');
        setNavigationStatus('disabled');
        alert('Bringup stopped. You can press Set to start again.');
      } else {
        alert(`Stop failed: ${res?.message ?? '(no message)'}`);
      }
    });
  };

  // Set button logic (bringup trigger)
  const callTrigger = (srv: ROSLIB.Service<any, any>) =>
    new Promise<any>((resolve) => srv.callService({} as any, resolve));

  const handleSet = async () => {
    if (mode !== 'manual driving') {
      alert('Set is only configured for: Mode = manual driving');
      return;
    }
    if (status !== 'active' || !startRobotSrvRef.current) {
      alert('Not connected to rosbridge yet.');
      return;
    }

    setStarting(true);
    setRobotStarted(false);
    
    // Reset module statuses
    setBringupStatus('disabled');
    setCartographerStatus('disabled');
    setNavigationStatus('disabled');

    try {
      // 1) bringup
      const bringupRes = await callTrigger(startRobotSrvRef.current);
      if (!bringupRes?.success) {
        setStarting(false);
        alert(`Bringup failed: ${bringupRes?.message ?? '(no message)'}`);
        return;
      }
      setBringupStatus('enabled');
      setRobotStarted(true);

      // 2) if SLAM yes, start cartographer
      if (slamEnabled === 'yes') {
        if (!startSlamSrvRef.current) {
          setStarting(false);
          alert('start_slam service not ready.');
          return;
        }
        const slamRes = await callTrigger(startSlamSrvRef.current);
        if (!slamRes?.success) {
          setStarting(false);
          alert(`Cartographer failed: ${slamRes?.message ?? '(no message)'}`);
          return;
        }
        setCartographerStatus('enabled');
      }

      setStarting(false);
    } catch (e) {
      console.error(e);
      setStarting(false);
      setRobotStarted(false);
      alert('Set failed (see console).');
    }
  };

  // DirectionalPad drives the robot
  const handleDirectionClick = (direction: 'up' | 'down' | 'left' | 'right' | 'stop') => {
    if (!robotStarted) {
      alert('Press Set first (Mode=manual driving, SLAM=no) to start the robot.');
      return;
    }

    if (!cmdVelRef.current) {
      console.warn('cmd_vel topic not ready');
      return;
    }

    let linear = 0;
    let angular = 0;

    switch (direction) {
      case 'up':
        linear = 0.15;
        angular = 0;
        break;
      case 'down':
        linear = -0.15;
        angular = 0;
        break;
      case 'left':
        linear = 0;
        angular = 0.6;
        break;
      case 'right':
        linear = 0;
        angular = -0.6;
        break;
      case 'stop':
        linear = 0;
        angular = 0;
        break;
    }

    const twist = {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    };
    cmdVelRef.current.publish(twist as any);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100">
      <div className="flex-1 flex border-b-2 border-black overflow-hidden">
        <div className="w-1/3 flex flex-col gap-4 p-4">
          <ControlPanel
            status={status}
            mode={mode}
            slamEnabled={slamEnabled}
            onModeChange={setMode}
            onSlamChange={setSlamEnabled}
            onExportMap={handleExportMap}
            onKillProcess={handleKillProcess}
            onSet={handleSet}
            setDisabled={status !== 'active' || starting}
            setLabel={starting ? 'starting...' : 'set'}
          />

          {/* Module Status Section */}
          <Module
            bringupStatus={bringupStatus}
            cartographerStatus={cartographerStatus}
            navigationStatus={navigationStatus}
            batteryPercentage={batteryPercentage}
          />

          {/* Disable the pad until robotStarted */}
          <div className={robotStarted ? '' : 'opacity-50 pointer-events-none'}>
            <DirectionalPad onDirectionClick={handleDirectionClick} />
          </div>
        </div>

        <div className="w-2/3 p-4 flex">
          <SlamMap ros={rosRef.current} topicName="/map" />
        </div>
      </div>

      <div className="h-24 border-b-2 border-black p-4 bg-slate-200">
        <p className="text-slate-700 text-sm">Console output / Logs (see browser devtools)</p>
      </div>
    </div>
  );
}