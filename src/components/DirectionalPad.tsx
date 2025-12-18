import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';

interface DirectionalPadProps {
  onDirectionClick: (direction: 'up' | 'down' | 'left' | 'right' | 'stop') => void;
  disabled?: boolean;
}

export function DirectionalPad({ onDirectionClick, disabled = false }: DirectionalPadProps) {
  const buttonClassName =
    'h-16 flex items-center justify-center border-2 border-black ' +
    (disabled
      ? 'bg-slate-200 opacity-40 cursor-not-allowed'
      : 'bg-white hover:bg-slate-700 hover:text-white active:bg-black');

  return (
    <div className="border-2 border-black p-6 bg-slate-50 w-64 shadow-md">
      <div className="grid grid-cols-3 gap-2">
        {/* Top row */}
        <div></div>
        <button
          disabled={disabled}
          onClick={() => onDirectionClick('up')}
          className={buttonClassName}
        >
          <ArrowUp className="w-8 h-8" strokeWidth={3} />
        </button>
        <div></div>

        {/* Middle row */}
        <button
          disabled={disabled}
          onClick={() => onDirectionClick('left')}
          className={buttonClassName}
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={3} />
        </button>

        <button
          disabled={disabled}
          onClick={() => onDirectionClick('stop')}
          className={buttonClassName}
        >
          <Square className="w-6 h-6" strokeWidth={3} />
        </button>

        <button
          disabled={disabled}
          onClick={() => onDirectionClick('right')}
          className={buttonClassName}
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
