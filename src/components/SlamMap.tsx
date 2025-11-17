import { useRef, useEffect, useState } from 'react';

export function SlamMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<{ x: number; y: number }[]>([]);

  // Simulate robot path/map data
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setMapData(prev => {
  //       const newPoint = {
  //         x: Math.random() * 500,
  //         y: Math.random() * 350,
  //       };
  //       return [...prev.slice(-50), newPoint]; // Keep last 50 points
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // // Draw on canvas
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   // Clear canvas with grey background
  //   ctx.fillStyle = '#f8fafc';
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);

  //   // Draw grid
  //   ctx.strokeStyle = '#cbd5e1';
  //   ctx.lineWidth = 1;
  //   for (let i = 0; i < canvas.width; i += 50) {
  //     ctx.beginPath();
  //     ctx.moveTo(i, 0);
  //     ctx.lineTo(i, canvas.height);
  //     ctx.stroke();
  //   }
  //   for (let i = 0; i < canvas.height; i += 50) {
  //     ctx.beginPath();
  //     ctx.moveTo(0, i);
  //     ctx.lineTo(canvas.width, i);
  //     ctx.stroke();
  //   }

  //   // Draw map points
  //   ctx.fillStyle = '#334155';
  //   mapData.forEach((point, index) => {
  //     const opacity = (index + 1) / mapData.length;
  //     ctx.globalAlpha = opacity;
  //     ctx.beginPath();
  //     ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
  //     ctx.fill();
  //   });
  //   ctx.globalAlpha = 1;

  //   // Draw path
  //   if (mapData.length > 1) {
  //     ctx.strokeStyle = '#475569';
  //     ctx.lineWidth = 2;
  //     ctx.beginPath();
  //     ctx.moveTo(mapData[0].x, mapData[0].y);
  //     mapData.forEach(point => {
  //       ctx.lineTo(point.x, point.y);
  //     });
  //     ctx.stroke();
  //   }

  // }, [mapData]);

  return (
    <div className="border-2 border-black h-full p-4 bg-slate-50 shadow-md">
      <div className="relative h-full border-2 border-slate-400 bg-white">
        <div className="absolute top-2 left-2 text-slate-500 pointer-events-none">
          SLAM map goes here
        </div>
        <canvas
          ref={canvasRef}
          // width={600}
          // height={400}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}