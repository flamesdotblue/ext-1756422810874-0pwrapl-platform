import React, { useMemo } from 'react';

export default function AbilityShop({ open, onClose, abilities, selected, onBuy, canUseShop, points }) {
  const playerPoints = useMemo(() => selected ? points[selected.color] : null, [selected, points]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ability Shop</h3>
          <button onClick={onClose} className="rounded-md bg-neutral-800 hover:bg-neutral-700 px-3 py-1 text-sm">Close</button>
        </div>
        <div className="mt-2 text-sm text-neutral-300">
          {selected ? (
            <div className="flex items-center justify-between">
              <div>Selected: <span className="font-semibold">{labelFor(selected)}</span> ({selected.color === 'w' ? 'White' : 'Black'})</div>
              <div>Points: <span className="font-semibold">{playerPoints}</span></div>
            </div>
          ) : (
            <div>Select a piece on the board to upgrade.</div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {abilities.map(a => {
            const owned = !!selected?.abilities?.includes(a.key);
            const affordable = selected ? (playerPoints ?? 0) >= a.cost : false;
            return (
              <div key={a.key} className={`rounded-xl border p-4 ${owned ? 'border-emerald-700/60 bg-emerald-900/20' : 'border-neutral-800 bg-neutral-800/40'}`}>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-neutral-400 mt-1">{a.desc}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-300">Cost: {a.cost}</span>
                  <button
                    disabled={!selected || !canUseShop || owned || !affordable}
                    onClick={() => onBuy(a.key)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${(!selected || !canUseShop || owned || !affordable) ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500'}`}
                  >
                    {owned ? 'Owned' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-neutral-400">
          Rules: Upgrades can be applied pre-game or during the match. Teleport and Swap-like powers (if any) can be used as a move. Capturing the King ends the game.
        </div>
      </div>
    </div>
  );
}

function labelFor(piece) {
  const names = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
  return `${piece.color === 'w' ? 'White' : 'Black'} ${names[piece.type]}`;
}
