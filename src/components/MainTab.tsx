// src/components/MainTab.tsx
import { useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';
import { ControlPanel } from './ControlPanel';
import { DirectionalPad } from './DirectionalPad';
import { SlamMap } from './SlamMap';
import { Module } from './Module';

type Status = 'Inactive' | 'Active';
type Mode = 'manual driving' | 'navigation';
type SlamEnabled = 'yes' | 'no';
type ModuleStatus = 'Disabled' | 'Enabled';

export function MainTab() {
  const [status, setStatus] = useState<Status>('Inactive');
  const [mode, setMode] = useState<Mode>('manual driving');
  const [slamEnabled, setSlamEnabled] = useState<SlamEnabled>('no');

  // "bringup done" flag for enabling the pad
  const [robotStarted, setRobotStarted] = useState(false);
  const [starting, setStarting] = useState(false);

  // Module status states
  const [bringupStatus, setBringupStatus] = useState<ModuleStatus>('Disabled');
  const [cartographerStatus, setCartographerStatus] = useState<ModuleStatus>('Disabled');
  const [navigationStatus, setNavigationStatus] = useState<ModuleStatus>('Disabled');

  // Battery state
  const [batteryPercentage, setBatteryPercentage] = useState<number | undefined>(undefined);

  // ROS connection + topics/services
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const cmdVelRef = useRef<ROSLIB.Topic<any> | null>(null);
  const startRobotSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const stopRobotSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const startSlamSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const saveMapSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const startNavSrvRef = useRef<ROSLIB.Service<any, any> | null>(null);
  const batteryTopicRef = useRef<ROSLIB.Topic<any> | null>(null);

  // NEW: throttle battery UI updates (3 seconds)
  const lastBatteryUiUpdateMsRef = useRef<number>(0);

  // Connect to rosbridge when MainTab mounts
  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://172.20.10.2:9090',
    });

    ros.on('connection', () => {
      console.log('Connected to rosbridge');
      setStatus('Active');

      // reset throttle on connect
      lastBatteryUiUpdateMsRef.current = 0;

      // Subscribe to battery topic when connected (use ros directly here)
      try {
        const batteryTopic = new ROSLIB.Topic({
          ros,
          name: '/battery_state',
          messageType: 'sensor_msgs/BatteryState',
        });

        batteryTopic.subscribe((message: any) => {
          let percentage: number | undefined;

          if (message?.percentage !== undefined) {
            // Handle both 0–1 and 0–100 conventions
            if (message.percentage <= 1.0) percentage = Math.round(message.percentage * 100);
            else percentage = Math.round(message.percentage);
          } else if (message?.voltage !== undefined) {
            // fallback voltage mapping
            const voltage = message.voltage;
            const maxVoltage = 12.6;
            const minVoltage = 9.9;
            const clampedVoltage = Math.min(maxVoltage, Math.max(minVoltage, voltage));
            percentage = Math.round(((clampedVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100);
          }

          if (percentage === undefined) return;

          const pct = Math.max(0, Math.min(100, Math.trunc(percentage)));

          // throttle: update at most once per 3 seconds          
          const now = Date.now();
          if (now - lastBatteryUiUpdateMsRef.current < 3000) return;

          lastBatteryUiUpdateMsRef.current = now;
          setBatteryPercentage(pct);
        });

        batteryTopicRef.current = batteryTopic;
        console.log('Subscribed to /battery_state');
      } catch (error) {
        console.log('Failed to subscribe /battery_state:', error);
      }
    });

    ros.on('error', (error) => {
      console.error('Error connecting to rosbridge:', error);
      setStatus('Inactive');
      setRobotStarted(false);
      // Reset all modules on error
      setBringupStatus('Disabled');
      setCartographerStatus('Disabled');
      setNavigationStatus('Disabled');
    });

    ros.on('close', () => {
      console.log('Disconnected from rosbridge');
      setStatus('Inactive');
      setRobotStarted(false);
      // Reset all modules on disconnect      
      setBringupStatus('Disabled');
      setCartographerStatus('Disabled');
      setNavigationStatus('Disabled');
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

    saveMapSrvRef.current = new ROSLIB.Service({
      ros,
      name: '/save_map',
      serviceType: 'std_srvs/Trigger',
    });

    startNavSrvRef.current = new ROSLIB.Service({
      ros,
      name: '/start_navigation',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional: periodic "status check" (ping-like) via websocket open/close
  useEffect(() => {
    const robotURL = 'ws://172.20.10.2:9090';

    const checkRobotStatus = () => {
      let opened = false;
      const ws = new WebSocket(robotURL);

      const markInactiveIfNotOpened = () => {
        if (!opened) {
          setStatus('Inactive');
          setRobotStarted(false);
        }
      };

      ws.onopen = () => {
        opened = true;
        setStatus('Active');
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
    if (status !== 'Active' || !saveMapSrvRef.current) {
      alert('Not connected to rosbridge yet.');
      return;
    }

    console.log('Exporting map...');

    saveMapSrvRef.current.callService({} as any, (res: any) => {
      if (res?.success) {
        alert('✅ Map saved on SBC: ~/map.yaml and ~/map.pgm');
      } else {
        alert(`❌ Save map failed: ${res?.message ?? '(no message)'}`);
      }
    });
  };

  const handleKillProcess = () => {
    if (status !== 'Active' || !stopRobotSrvRef.current) {
      alert('Not connected to rosbridge yet.');
      return;
    }

    setStarting(true);

    stopRobotSrvRef.current.callService({} as any, (res: any) => {
      setStarting(false);

      if (res?.success) {
        setRobotStarted(false);
        // Reset all modules to disabled
        setBringupStatus('Disabled');
        setCartographerStatus('Disabled');
        setNavigationStatus('Disabled');
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
    if (status !== 'Active' || !startRobotSrvRef.current) {
      alert('Not connected to rosbridge yet.');
      return;
    }

    setStarting(true);
    setRobotStarted(false);

    // Reset module statuses
    setBringupStatus('Disabled');
    setCartographerStatus('Disabled');
    setNavigationStatus('Disabled');

    try {
      // 1) bringup (always required for both manual + navigation)
      const bringupRes = await callTrigger(startRobotSrvRef.current);
      if (!bringupRes?.success) {
        setStarting(false);
        alert(`Bringup failed: ${bringupRes?.message ?? '(no message)'}`);
        return;
      }
      setBringupStatus('Enabled');
      setRobotStarted(true);

      // 2) mode branching
      if (mode === 'manual driving') {
        // If SLAM yes, start cartographer
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
          setCartographerStatus('Enabled');
        }
      } else if (mode === 'navigation') {
        // Start navigation node
        if (!startNavSrvRef.current) {
          setStarting(false);
          alert('start_navigation service not ready.');
          return;
        }
        const navRes = await callTrigger(startNavSrvRef.current);
        if (!navRes?.success) {
          setStarting(false);
          alert(`Navigation failed: ${navRes?.message ?? '(no message)'}`);
          return;
        }
        setNavigationStatus('Enabled');
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
      <div className="flex-1 flex border-b-2 border-black overflow-hidden" style={{ justifyContent: 'center' }}>
        <div className="w-1/3 flex flex-col gap-4 p-4">
          <ControlPanel
            status={status}
            mode={mode}
            slamEnabled={slamEnabled}
            onModeChange={setMode}
            onSlamChange={setSlamEnabled}
            onExportMap={handleExportMap}
            exportDisabled={cartographerStatus !== 'Enabled'}
            slamDisabled={mode === 'navigation'}
            onKillProcess={handleKillProcess}
            onSet={handleSet}
            setDisabled={status !== 'Active' || starting || bringupStatus === 'Enabled'}
            setLabel={starting ? 'starting...' : 'set'}
          />

          {/* Module Status Section */}
          <Module
            bringupStatus={bringupStatus}
            cartographerStatus={cartographerStatus}
            navigationStatus={navigationStatus}
            batteryPercentage={batteryPercentage}
          />

          {/* Disable the pad when bringup is disabled */}
          <DirectionalPad
            onDirectionClick={handleDirectionClick}
            disabled={bringupStatus !== 'Enabled'}
          />
        </div>

        <div className="w-2/3 p-4 flex" style={{ maxWidth: '1000px' }}>
          <SlamMap ros={rosRef.current} topicName="/map" />
        </div>
      </div>

      <div className="h-24 border-b-2 border-black p-4 bg-slate-200">
        <p className="text-slate-700 text-sm">Console output / Logs (see browser devtools)</p>
      </div>
    </div>
  );
}
