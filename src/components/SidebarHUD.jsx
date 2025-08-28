import React from 'react';

export default function SidebarHUD({ points, turn, phase, winner, onReset, onStart, onOpenShop, lastMove }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Match Control</h2>
        <span className="text-xs text-neutral-400">{phase === 'pre' ? 'Pre-Game' : phase === 'in' ? 'In-Game' : 'Game Over'}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-neutral-800/60 p-3">
          <div className="text-neutral-400">White Points</div>
          <div className="text-lg font-semibold">{points.w}</div>
        </div>
        <div className="rounded-lg bg-neutral-800/60 p-3">
          <div className="text-neutral-400">Black Points</div>
          <div className="text-lg font-semibold">{points.b}</div>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <div className="rounded-lg bg-neutral-800/60 p-3 flex items-center justify-between">
          <span className="text-neutral-300">Turn</span>
          <span className="font-semibold">{turn === 'w' ? 'White' : 'Black'}</span>
        </div>
        {lastMove && (
          <div className="mt-2 rounded-lg bg-neutral-800/60 p-3 text-neutral-300">
            Last Move: {String.fromCharCode(97 + lastMove.from.c)}{8 - lastMove.from.r} → {String.fromCharCode(97 + lastMove.to.c)}{8 - lastMove.to.r}
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {phase === 'pre' && (
          <button onClick={onStart} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition px-4 py-2 font-medium">Start Game</button>
        )}
        <button onClick={onOpenShop} className="flex-1 rounded-lg bg-sky-600 hover:bg-sky-500 transition px-4 py-2 font-medium">Open Ability Shop</button>
      </div>
      <div className="mt-2">
        <button onClick={onReset} className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-700 transition px-4 py-2 text-sm">Reset</button>
      </div>
      {phase === 'over' && (
        <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
          <div className="font-semibold text-yellow-300">Winner: {winner === 'w' ? 'White' : 'Black'}</div>
          <div className="text-sm text-yellow-200/90">30 bonus points awarded.</div>
        </div>
      )}
      <div className="mt-4 text-xs text-neutral-400">
        Tip: In Pre-Game, assign abilities to your pieces. During the match, you can still upgrade on your turn.
      </div>
    </div>
  );
}
