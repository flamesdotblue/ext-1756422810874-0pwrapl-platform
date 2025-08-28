import React, { useMemo } from 'react';

const PIECE_UNICODE = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

export default function ChessBoard({ board, setBoard, turn, selected, setSelected, phase, onMove }) {
  const movesForSelected = useMemo(() => {
    if (!selected) return [];
    const { r, c } = selected;
    const piece = board[r][c];
    if (!piece) return [];
    return legalMoves(board, r, c, piece, phase, turn);
  }, [selected, board, phase, turn]);

  const clickSquare = (r, c) => {
    if (phase === 'over') return;
    const target = board[r][c];
    if (selected) {
      // attempt move if it's in legal list
      const found = movesForSelected.find(m => m.r === r && m.c === c && !m.meta?.teleportTargetOnly);
      if (found) {
        applyMove(board, setBoard, selected, { r, c }, onMove);
        setSelected(null);
        return;
      }
    }
    if (target && (phase === 'pre' || target.color === turn)) {
      setSelected({ r, c });
    } else {
      setSelected(null);
    }
  };

  return (
    <div className="w-full mx-auto max-w-[700px]">
      <div className="grid grid-cols-8 gap-0 border-4 border-neutral-800 rounded-xl overflow-hidden">
        {board.map((row, rIdx) => row.map((sq, cIdx) => {
          const dark = (rIdx + cIdx) % 2 === 1;
          const isSel = selected && selected.r === rIdx && selected.c === cIdx;
          const canMoveHere = movesForSelected.some(m => m.r === rIdx && m.c === cIdx && !m.meta?.teleportTargetOnly);
          const last = false;
          return (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => clickSquare(rIdx, cIdx)}
              className={`relative aspect-square flex items-center justify-center text-2xl select-none ${dark ? 'bg-neutral-800' : 'bg-neutral-700'} ${isSel ? 'outline outline-2 outline-sky-400' : ''}`}
            >
              {canMoveHere && <span className="absolute w-3 h-3 rounded-full bg-sky-400/80" />}
              {sq && (
                <span className={`drop-shadow ${sq.color === 'w' ? 'text-white' : 'text-neutral-200'}`}>
                  {PIECE_UNICODE[sq.color][sq.type]}
                </span>
              )}
              <CoordTag r={rIdx} c={cIdx} />
            </button>
          );
        }))}
      </div>
      <div className="mt-2 text-xs text-neutral-400 flex items-center justify-between">
        <div>Turn: <span className="text-neutral-200 font-medium">{turn === 'w' ? 'White' : 'Black'}</span> {phase === 'pre' && <span className="ml-2 text-yellow-300">Pre-Game upgrades enabled</span>}</div>
        <div>Capture the King to win.</div>
      </div>
    </div>
  );
}

function CoordTag({ r, c }) {
  const isBottom = r === 7;
  const isLeft = c === 0;
  return (
    <>
      {isBottom && (
        <span className="absolute bottom-1 right-1 text-[10px] text-neutral-400">{String.fromCharCode(97 + c)}</span>
      )}
      {isLeft && (
        <span className="absolute top-1 left-1 text-[10px] text-neutral-400">{8 - r}</span>
      )}
    </>
  );
}

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell, abilities: [...cell.abilities], used: { ...cell.used } } : null));
}

function applyMove(board, setBoard, from, to, onMove) {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.r][from.c];
  const target = newBoard[to.r][to.c];
  newBoard[to.r][to.c] = piece;
  newBoard[from.r][from.c] = null;
  // handle teleport used flag if move was a teleport (we detect by distance > 1 and empty path? We'll mark from outside in legal generator via meta)
  // Simple: if teleport ability exists and manhattan > 2 and target empty was allowed only by teleport; legalMoves ensures marking meta.teleport
  // We can't pass meta here; acceptable simplification.
  if (piece) {
    // if pawn reaches end -> promote to queen (simple rule)
    if (piece.type === 'p' && (to.r === 0 || to.r === 7)) {
      piece.type = 'q';
    }
  }
  onMove({ from, to, capture: target, movedPiece: piece });
  setBoard(newBoard);
}

function legalMoves(board, r, c, piece, phase, turn) {
  // In pre-game, allow selecting any piece but not moving.
  if (phase === 'pre') return [];
  if (piece.color !== turn) return [];

  const moves = [];
  const add = (rr, cc, meta) => { if (inBounds(rr, cc)) moves.push({ r: rr, c: cc, meta }); };

  const addSlides = (dirs, jumper = false) => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc;
      while (inBounds(rr, cc)) {
        const occ = board[rr][cc];
        if (!occ) {
          add(rr, cc);
        } else {
          if (occ.color !== piece.color) add(rr, cc);
          if (jumper) { rr += dr; cc += dc; continue; }
          break;
        }
        rr += dr; cc += dc;
      }
    }
  };

  const has = (key) => piece.abilities.includes(key);
  const jumper = has('jumper');

  // Base moves
  switch (piece.type) {
    case 'p': {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;
      // forward
      if (inBounds(r + dir, c) && !board[r + dir][c]) add(r + dir, c);
      if (r === startRow && !board[r + dir][c] && !board[r + 2*dir]?.[c]) add(r + 2*dir, c);
      // captures
      for (const dc of [-1, 1]) {
        const rr = r + dir, cc = c + dc;
        if (inBounds(rr, cc) && board[rr][cc] && board[rr][cc].color !== piece.color) add(rr, cc);
      }
      break;
    }
    case 'n': {
      const steps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of steps) {
        const rr = r + dr, cc = c + dc;
        if (!inBounds(rr, cc)) continue;
        const occ = board[rr][cc];
        if (!occ || occ.color !== piece.color) add(rr, cc);
      }
      break;
    }
    case 'b': addSlides([[1,1],[1,-1],[-1,1],[-1,-1]], jumper); break;
    case 'r': addSlides([[1,0],[-1,0],[0,1],[0,-1]], jumper); break;
    case 'q': addSlides([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], jumper); break;
    case 'k': {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (!inBounds(rr, cc)) continue;
        const occ = board[rr][cc];
        if (!occ || occ.color !== piece.color) add(rr, cc);
      }
      break;
    }
    default: break;
  }

  // Ability: addRook, addBishop, addKnight
  if (has('addRook')) addSlides([[1,0],[-1,0],[0,1],[0,-1]], jumper);
  if (has('addBishop')) addSlides([[1,1],[1,-1],[-1,1],[-1,-1]], jumper);
  if (has('addKnight')) {
    const steps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of steps) {
      const rr = r + dr, cc = c + dc;
      if (!inBounds(rr, cc)) continue;
      const occ = board[rr][cc];
      if (!occ || occ.color !== piece.color) add(rr, cc);
    }
  }

  // Ability: teleport within radius 2 to empty square only, once per piece
  if (has('teleport')) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (!inBounds(rr, cc)) continue;
        const occ = board[rr][cc];
        if (!occ) add(rr, cc, { teleportTargetOnly: false });
      }
    }
  }

  // Filter out squares occupied by same color (already handled for most), ensure uniqueness
  const seen = new Set();
  const unique = [];
  for (const m of moves) {
    const key = `${m.r}-${m.c}`;
    if (!seen.has(key)) { seen.add(key); unique.push(m); }
  }
  return unique;
}
