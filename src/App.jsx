import React, { useMemo, useState } from 'react';
import Hero3D from './components/Hero3D';
import ChessBoard from './components/ChessBoard';
import AbilityShop from './components/AbilityShop';
import SidebarHUD from './components/SidebarHUD';

const STARTING_POINTS = 20;

const ABILITIES = [
  { key: 'addRook', name: 'Add Rook Moves', cost: 7, desc: 'Grants rook-like orthogonal sliding moves.' },
  { key: 'addBishop', name: 'Add Bishop Moves', cost: 6, desc: 'Grants bishop-like diagonal sliding moves.' },
  { key: 'addKnight', name: 'Add Knight Moves', cost: 5, desc: 'Grants knight-like L-shaped jumps.' },
  { key: 'jumper', name: 'Jumper', cost: 8, desc: 'Ignores blockers when sliding (rook/bishop/queen/additions).' },
  { key: 'teleport', name: 'Teleport (1x)', cost: 10, desc: 'Once per game, move to any empty square within radius 2.' },
];

const CAPTURE_POINTS = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 20 };

function makeInitialBoard() {
  // using lowercase for piece type: p,n,b,r,q,k; color: 'w' | 'b'
  const empty = Array.from({ length: 8 }, () => Array(8).fill(null));
  const place = (r, c, type, color) => ({ id: `${color}-${type}-${r}-${c}-${Math.random().toString(36).slice(2,7)}`, type, color, abilities: [], used: { teleport: false } });
  const board = empty.map(row => row.slice());
  // white at bottom (rows 6,7)
  for (let c = 0; c < 8; c++) {
    board[6][c] = place(6, c, 'p', 'w');
    board[1][c] = place(1, c, 'p', 'b');
  }
  board[7][0] = place(7, 0, 'r', 'w');
  board[7][7] = place(7, 7, 'r', 'w');
  board[7][1] = place(7, 1, 'n', 'w');
  board[7][6] = place(7, 6, 'n', 'w');
  board[7][2] = place(7, 2, 'b', 'w');
  board[7][5] = place(7, 5, 'b', 'w');
  board[7][3] = place(7, 3, 'q', 'w');
  board[7][4] = place(7, 4, 'k', 'w');

  board[0][0] = place(0, 0, 'r', 'b');
  board[0][7] = place(0, 7, 'r', 'b');
  board[0][1] = place(0, 1, 'n', 'b');
  board[0][6] = place(0, 6, 'n', 'b');
  board[0][2] = place(0, 2, 'b', 'b');
  board[0][5] = place(0, 5, 'b', 'b');
  board[0][3] = place(0, 3, 'q', 'b');
  board[0][4] = place(0, 4, 'k', 'b');
  return board;
}

export default function App() {
  const [board, setBoard] = useState(makeInitialBoard);
  const [turn, setTurn] = useState('w');
  const [selected, setSelected] = useState(null); // { r, c }
  const [points, setPoints] = useState({ w: STARTING_POINTS, b: STARTING_POINTS });
  const [phase, setPhase] = useState('pre'); // 'pre' | 'in' | 'over'
  const [winner, setWinner] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  const resetGame = () => {
    setBoard(makeInitialBoard());
    setTurn('w');
    setSelected(null);
    setPoints({ w: STARTING_POINTS, b: STARTING_POINTS });
    setPhase('pre');
    setWinner(null);
    setShopOpen(false);
    setLastMove(null);
  };

  const startGame = () => {
    setPhase('in');
  };

  const endGame = (winnerColor) => {
    setWinner(winnerColor);
    setPhase('over');
    setPoints(prev => ({ ...prev, [winnerColor]: prev[winnerColor] + 30 }));
  };

  const applyAbilityToPiece = (abilityKey, target) => {
    if (!target) return;
    const { r, c } = target;
    const piece = board[r][c];
    if (!piece) return;
    if (piece.abilities.includes(abilityKey)) return;
    const cost = ABILITIES.find(a => a.key === abilityKey)?.cost || 0;
    if (points[piece.color] < cost) return;
    const newBoard = board.map(row => row.slice());
    newBoard[r][c] = { ...piece, abilities: [...piece.abilities, abilityKey] };
    setBoard(newBoard);
    setPoints(prev => ({ ...prev, [piece.color]: prev[piece.color] - cost }));
  };

  const buyAbility = (abilityKey) => {
    if (!selected) return;
    applyAbilityToPiece(abilityKey, selected);
  };

  const onMove = ({ from, to, capture, movedPiece }) => {
    if (capture) {
      const capType = capture.type;
      const earn = CAPTURE_POINTS[capType] || 0;
      setPoints(prev => ({ ...prev, [movedPiece.color]: prev[movedPiece.color] + earn }));
      if (capType === 'k') {
        endGame(movedPiece.color);
      }
    }
    setTurn(prev => (prev === 'w' ? 'b' : 'w'));
    setLastMove({ from, to });
  };

  const canUseShop = useMemo(() => phase !== 'over', [phase]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col">
      <section className="relative h-[50vh] w-full overflow-hidden">
        <Hero3D />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80" />
        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <div className="text-center max-w-3xl px-4">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Custom Chess: Forge Your Army</h1>
            <p className="mt-3 text-neutral-300">Earn points by capturing and winning. Spend points to grant special abilities pre-game or mid-match. Strategy meets progression.</p>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col gap-4">
          <ChessBoard
            board={board}
            setBoard={setBoard}
            turn={turn}
            setTurn={setTurn}
            selected={selected}
            setSelected={setSelected}
            phase={phase}
            onMove={onMove}
          />
        </div>
        <aside className="flex flex-col gap-4">
          <SidebarHUD
            points={points}
            turn={turn}
            phase={phase}
            winner={winner}
            onReset={resetGame}
            onStart={startGame}
            onOpenShop={() => setShopOpen(true)}
            lastMove={lastMove}
          />
          <AbilityShop
            open={shopOpen}
            onClose={() => setShopOpen(false)}
            abilities={ABILITIES}
            selected={selected ? board[selected.r][selected.c] : null}
            onBuy={buyAbility}
            canUseShop={canUseShop}
            points={points}
          />
        </aside>
      </main>
    </div>
  );
}
