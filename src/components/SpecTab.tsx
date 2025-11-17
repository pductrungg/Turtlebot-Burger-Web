export function SpecTab() {
  return (
    <div className="p-8 border-b-2 border-black min-h-[calc(100vh-120px)]">
      <div className="max-w-4xl">
        <h2 className="mb-6">Technical Specifications</h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="mb-3">Hardware</h3>
            <table className="w-full border-2 border-black">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">Processor</td>
                  <td className="p-3">ARM Cortex-A72 @ 1.5GHz</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">Memory</td>
                  <td className="p-3">4GB LPDDR4</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">Sensors</td>
                  <td className="p-3">LiDAR, IMU, Wheel Encoders, RGB Camera</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">Max Speed</td>
                  <td className="p-3">1.0 m/s</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-black">Battery</td>
                  <td className="p-3">24V 20Ah Li-ion, ~4 hours runtime</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="mb-3">Software</h3>
            <table className="w-full border-2 border-black">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">OS</td>
                  <td className="p-3">Ubuntu 22.04 LTS</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">Framework</td>
                  <td className="p-3">ROS 2 Humble</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-3 border-r border-black">SLAM Algorithm</td>
                  <td className="p-3">Cartographer / GMapping</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-black">Navigation</td>
                  <td className="p-3">Nav2 Stack</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="mb-3">Dimensions</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Length: 450mm</li>
              <li>Width: 380mm</li>
              <li>Height: 250mm</li>
              <li>Weight: 8.5kg</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-3">Communication</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>WiFi 802.11ac (2.4GHz/5GHz)</li>
              <li>Ethernet 100/1000 Mbps</li>
              <li>WebSocket API for remote control</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
