import { useEffect, useMemo, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';

type Props = {
  ros: ROSLIB.Ros | null;
  topicName?: string; // default: /map
};

type OccupancyGridMsg = {
  info: {
    width: number;
    height: number;
    resolution: number;
    origin: {
      position: { x: number; y: number; z: number };
      orientation: { x: number; y: number; z: number; w: number };
    };
  };
  data: number[];
};

// tf2_msgs/TFMessage (as it arrives through rosbridge)
type TfTransform = {
  header: { frame_id: string };
  child_frame_id: string;
  transform: {
    translation: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
  };
};
type TfMessage = { transforms: TfTransform[] };

type Pose2D = { x: number; y: number; yaw: number };

type Quat = { x: number; y: number; z: number; w: number };
type Vec3 = { x: number; y: number; z: number };
type Transform3 = { t: Vec3; q: Quat };

function quatMul(a: Quat, b: Quat): Quat {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

function quatNormalize(q: Quat): Quat {
  const n = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w) || 1;
  return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}

function quatRotateVec(qIn: Quat, v: Vec3): Vec3 {
  const q = quatNormalize(qIn);
  // v' = q * (0,v) * q^-1
  const p: Quat = { x: v.x, y: v.y, z: v.z, w: 0 };
  const qInv: Quat = { x: -q.x, y: -q.y, z: -q.z, w: q.w };
  const qp = quatMul(q, p);
  const out = quatMul(qp, qInv);
  return { x: out.x, y: out.y, z: out.z };
}

function compose(a: Transform3, b: Transform3): Transform3 {
  // T_ac = T_ab ∘ T_bc
  const rb = quatRotateVec(a.q, b.t);
  return {
    t: { x: a.t.x + rb.x, y: a.t.y + rb.y, z: a.t.z + rb.z },
    q: quatNormalize(quatMul(a.q, b.q)),
  };
}

function yawFromQuat(q: Quat): number {
  const siny = 2 * (q.w * q.z + q.x * q.y);
  const cosy = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(siny, cosy);
}

export function SlamMap({ ros, topicName = '/map' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mapInfo, setMapInfo] = useState<{ w: number; h: number } | null>(null);

  // keep last occupancy image (raw pixels, unscaled)
  const lastImageRef = useRef<ImageData | null>(null);
  const lastWHRef = useRef<{ w: number; h: number } | null>(null);

  // offscreen canvas cache (avoid recreating each draw)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  // keep map metadata needed for world->pixel
  const mapMetaRef = useRef<{
    w: number;
    h: number;
    resolution: number;
    originX: number;
    originY: number;
  } | null>(null);

  // store latest TFs: key = `${parent}->${child}`
  const tfStoreRef = useRef<Map<string, Transform3>>(new Map());

  // robot pose in map frame (state is only for showing text label)
  const [robotPose, setRobotPose] = useState<Pose2D | null>(null);
  const robotPoseRef = useRef<Pose2D | null>(null);

  // remember how we drew the map (scale + offset) so overlays match
  const drawParamsRef = useRef<{ scale: number; offsetX: number; offsetY: number } | null>(null);

  // --- redraw scheduling (prevents flashing with high-rate /tf)
  const rafPendingRef = useRef(false);
  const scheduleDraw = () => {
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      drawToCanvas();
    });
  };

  // limit how often we update React state for pose label
  const lastPoseStateUpdateMsRef = useRef(0);

  // Resize canvas to fit the right panel
  useEffect(() => {
    const el = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      scheduleDraw();
    });

    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapTopic = useMemo(() => {
    if (!ros) return null;
    return new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType: 'nav_msgs/OccupancyGrid',
      queue_size: 1,
      throttle_rate: 0,
    });
  }, [ros, topicName]);

  const tfTopic = useMemo(() => {
    if (!ros) return null;
    return new ROSLIB.Topic({
      ros,
      name: '/tf',
      messageType: 'tf2_msgs/TFMessage',
      queue_size: 10,
      throttle_rate: 0,
    });
  }, [ros]);

  const tfStaticTopic = useMemo(() => {
    if (!ros) return null;
    return new ROSLIB.Topic({
      ros,
      name: '/tf_static',
      messageType: 'tf2_msgs/TFMessage',
      queue_size: 10,
      throttle_rate: 0,
    });
  }, [ros]);

  // OccupancyGrid subscription
  useEffect(() => {
    if (!mapTopic) return;

    const onMsg = (msg: any) => {
      const grid = msg as OccupancyGridMsg;

      const w = grid.info.width;
      const h = grid.info.height;
      const data = grid.data;

      if (!w || !h || data.length !== w * h) return;

      setMapInfo({ w, h });

      mapMetaRef.current = {
        w,
        h,
        resolution: grid.info.resolution,
        originX: grid.info.origin.position.x,
        originY: grid.info.origin.position.y,
      };

      const img = new ImageData(w, h);
      for (let y = 0; y < h; y++) {
        const srcRow = y;
        const dstRow = h - 1 - y; // flip Y to match "up" on canvas
        for (let x = 0; x < w; x++) {
          const srcIdx = srcRow * w + x;
          const dstIdx = (dstRow * w + x) * 4;

          const v = data[srcIdx];
          let c = 255;
          if (v === -1) c = 205; // unknown
          else if (v >= 50) c = 0; // occupied

          img.data[dstIdx + 0] = c;
          img.data[dstIdx + 1] = c;
          img.data[dstIdx + 2] = c;
          img.data[dstIdx + 3] = 255;
        }
      }

      lastImageRef.current = img;
      lastWHRef.current = { w, h };

      // refresh cached offscreen
      if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
      offscreenRef.current.width = w;
      offscreenRef.current.height = h;
      const offCtx = offscreenRef.current.getContext('2d');
      if (offCtx) offCtx.putImageData(img, 0, 0);

      scheduleDraw();
    };

    mapTopic.subscribe(onMsg);
    return () => mapTopic.unsubscribe(onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTopic]);

  // TF subscriptions + pose extraction
  useEffect(() => {
    if (!tfTopic && !tfStaticTopic) return;

    const robotFrames = ['base_footprint', 'base_link']; // try these in order
    const fixedFrame = 'map';
    const odomFrame = 'odom';

    const upsert = (t: TfTransform) => {
      const parent = (t.header?.frame_id ?? '').replace(/^\/+/, '');
      const child = (t.child_frame_id ?? '').replace(/^\/+/, '');
      if (!parent || !child) return;

      tfStoreRef.current.set(`${parent}->${child}`, {
        t: { x: t.transform.translation.x, y: t.transform.translation.y, z: t.transform.translation.z },
        q: quatNormalize({
          x: t.transform.rotation.x,
          y: t.transform.rotation.y,
          z: t.transform.rotation.z,
          w: t.transform.rotation.w,
        }),
      });
    };

    const tryComputePose = () => {
      const store = tfStoreRef.current;
      const get = (p: string, c: string) => store.get(`${p}->${c}`) ?? null;

      let best: Transform3 | null = null;

      // 1) direct map->base_footprint / map->base_link
      for (const rf of robotFrames) {
        const direct = get(fixedFrame, rf);
        if (direct) {
          best = direct;
          break;
        }
      }

      // 2) compose map->odom + odom->base_footprint/base_link (common cartographer setup)
      if (!best) {
        const m2o = get(fixedFrame, odomFrame);
        if (m2o) {
          for (const rf of robotFrames) {
            const o2b = get(odomFrame, rf);
            if (o2b) {
              best = compose(m2o, o2b);
              break;
            }
          }
        }
      }

      if (!best) return;

      const yaw = yawFromQuat(best.q);
      const pose: Pose2D = { x: best.t.x, y: best.t.y, yaw };
      robotPoseRef.current = pose;

      // Update label at ~10Hz max, but redraw overlay at animation frame speed
      const now = Date.now();
      if (now - lastPoseStateUpdateMsRef.current >= 100) {
        lastPoseStateUpdateMsRef.current = now;
        setRobotPose(pose);
      }

      scheduleDraw();
    };

    const onTf = (msg: any) => {
      const m = msg as TfMessage;
      if (!m?.transforms?.length) return;
      for (const t of m.transforms) upsert(t);
      tryComputePose();
    };

    if (tfTopic) tfTopic.subscribe(onTf);
    if (tfStaticTopic) tfStaticTopic.subscribe(onTf);

    return () => {
      try {
        if (tfTopic) tfTopic.unsubscribe(onTf);
      } catch {}
      try {
        if (tfStaticTopic) tfStaticTopic.unsubscribe(onTf);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfTopic, tfStaticTopic]);

  const drawRobotOverlay = (ctx: CanvasRenderingContext2D) => {
    const meta = mapMetaRef.current;
    const wh = lastWHRef.current;
    const p = robotPoseRef.current;
    const drawParams = drawParamsRef.current;

    if (!meta || !wh || !p || !drawParams) return;

    // world (map frame) -> grid cell
    const gx = (p.x - meta.originX) / meta.resolution;
    const gy = (p.y - meta.originY) / meta.resolution;

    if (!Number.isFinite(gx) || !Number.isFinite(gy)) return;

    // because we flipped Y in the occupancy ImageData:
    const px = gx;
    const py = (wh.h - 1) - gy;

    // map-image pixel -> canvas pixel (using same scale/offset as drawImage)
    const cx = drawParams.offsetX + px * drawParams.scale;
    const cy = drawParams.offsetY + py * drawParams.scale;

    // FIX: keep marker size in SCREEN pixels (not scaled with map)
    const r = 9; // dot radius in px
    const len = 45; // arrow length in px
    const lineW = 4; // arrow line width in px

    ctx.save();
    ctx.translate(cx, cy);

    // dot
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,0.85)';
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // outline (makes it easier to see on black walls)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();

    // heading (map frame yaw: CCW). Because our image is vertically flipped, yaw must be mirrored.
    const yawForCanvas = -p.yaw;

    ctx.strokeStyle = 'rgba(255,0,0,0.85)';
    ctx.lineWidth = lineW;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(yawForCanvas) * len, Math.sin(yawForCanvas) * len);
    ctx.stroke();

    ctx.restore();
  };

  const drawToCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const wh = lastWHRef.current;

    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!wh) return;

    const off = offscreenRef.current;
    if (!off) return;

    // Fit with aspect ratio (no stretching)
    const scale = Math.min(canvas.width / wh.w, canvas.height / wh.h);
    const drawW = Math.floor(wh.w * scale);
    const drawH = Math.floor(wh.h * scale);
    const offsetX = Math.floor((canvas.width - drawW) / 2);
    const offsetY = Math.floor((canvas.height - drawH) / 2);

    drawParamsRef.current = { scale, offsetX, offsetY };

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, wh.w, wh.h, offsetX, offsetY, drawW, drawH);

    // overlay robot pose (if available)
    drawRobotOverlay(ctx);
  };

  // when pose label updates, also ensure we redraw (safe)
  useEffect(() => {
    scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotPose]);

  return (
    <div className="border-2 border-black h-full p-4 bg-slate-50 shadow-md w-full">
      <div ref={wrapperRef} className="relative h-full border-2 border-slate-400 bg-white overflow-hidden">
        <div className="absolute top-2 left-2 text-slate-500 pointer-events-none text-sm">
          {mapInfo ? `Mapping... (${topicName})  ${mapInfo.w}×${mapInfo.h}` : `Waiting for ${topicName}...`}
          {robotPose ? `   |   robot: (${robotPose.x.toFixed(2)}, ${robotPose.y.toFixed(2)})` : ''}
        </div>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
