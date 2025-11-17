import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';

interface DirectionalPadProps {
  onDirectionClick: (direction: 'up' | 'down' | 'left' | 'right' | 'stop') => void;
}

export function DirectionalPad({ onDirectionClick }: DirectionalPadProps) {
  return (
    <div className="border-2 border-black p-6 bg-slate-50 w-64 shadow-md">
      <div className="grid grid-cols-3 gap-2">
        {/* Top row */}
        <div></div>
        <button
          onClick={() => onDirectionClick('up')}
          className="h-16 flex items-center justify-center border-2 border-black bg-white hover:bg-slate-700 hover:text-white active:bg-black"
        >
          <ArrowUp className="w-8 h-8" strokeWidth={3} />
        </button>
        <div></div>

        {/* Middle row */}
        <button
          onClick={() => onDirectionClick('left')}
          className="h-16 flex items-center justify-center border-2 border-black bg-white hover:bg-slate-700 hover:text-white active:bg-black"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={3} />
        </button>
        <button
          onClick={() => onDirectionClick('stop')}
          className="h-16 flex items-center justify-center border-2 border-black bg-white hover:bg-slate-700 hover:text-white active:bg-black"
        >
          <Square className="w-6 h-6" strokeWidth={3} />
        </button>
        <button
          onClick={() => onDirectionClick('right')}
          className="h-16 flex items-center justify-center border-2 border-black bg-white hover:bg-slate-700 hover:text-white active:bg-black"
        >
          <ArrowRight className="w-8 h-8" strokeWidth={3} />
        </button>

        {/* Bottom row - empty */}
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}