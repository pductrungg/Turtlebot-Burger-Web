export function InstructionTab() {
  return (
    <div className="p-8 border-b-2 border-black min-h-[calc(100vh-120px)]">
      <div className="max-w-4xl">
        <h2 className="mb-6">Instructions</h2>
        
        <div className="space-y-6">
          <section>
            <h3 className="mb-3">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li>Set the robot status to "active" to begin operation</li>
              <li>Choose between "manual driving" or "navigation" mode</li>
              <li>Enable SLAM if you want to create a map of the environment</li>
              <li>Use the directional pad to control robot movement</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-3">Control Modes</h3>
            <div className="space-y-4 text-slate-700">
              <div>
                <strong>Manual Driving:</strong> Direct control using the directional pad. Use arrow buttons to move the robot.
              </div>
              <div>
                <strong>Navigation:</strong> Autonomous navigation mode. The robot will navigate to waypoints automatically.
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3">SLAM Mapping</h3>
            <p className="text-slate-700">
              Enable SLAM (Simultaneous Localization and Mapping) to create a real-time map of the environment. 
              The map will be displayed in the main view and can be exported for later use.
            </p>
          </section>

          <section>
            <h3 className="mb-3">Safety</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Always monitor the robot during operation</li>
              <li>Use the stop button (center button on directional pad) to halt movement immediately</li>
              <li>Use "kill process" to emergency stop all operations</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
