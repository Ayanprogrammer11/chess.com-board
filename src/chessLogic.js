// Helper function to check if a move is within the board
const isValidPosition = (position) => {
  const [file, rank] = position.split("");
  return file >= "a" && file <= "h" && rank >= "1" && rank <= "8";
};

// Helper function to get new position after a move
const getNewPosition = (position, fileOffset, rankOffset) => {
  const [file, rank] = position.split("");
  const newFile = String.fromCharCode(file.charCodeAt(0) + fileOffset);
  const newRank = String(parseInt(rank) + rankOffset);
  return newFile + newRank;
};

// Helper function to check if a position is occupied by a piece
const isOccupied = (position, piecePositions) => {
  return piecePositions.some((piece) => piece.position === position);
};

export const getPossibleMoves = (piece, position, piecePositions) => {
  const [pieceType, pieceColor] = piece.split("_");
  let moves = [];

  switch (pieceType) {
    case "pawn":
      moves = getPawnMoves(position, pieceColor, piecePositions);
      break;
    case "rook":
      moves = getRookMoves(position, piecePositions);
      break;
    case "knight":
      moves = getKnightMoves(position, piecePositions);
      break;
    case "bishop":
      moves = getBishopMoves(position, piecePositions);
      break;
    case "queen":
      moves = getQueenMoves(position, piecePositions);
      break;
    case "king":
      moves = getKingMoves(position, piecePositions);
      break;
  }

  return moves.filter((move) => isValidPosition(move));
};

const getPawnMoves = (position, color, piecePositions) => {
  const [file, rank] = position.split("");
  const direction = color === "white" ? 1 : -1;
  const moves = [];

  // Move forward
  const forwardMove = getNewPosition(position, 0, direction);
  if (!isOccupied(forwardMove, piecePositions)) {
    moves.push(forwardMove);

    // Double move from starting position
    if (
      (color === "white" && rank === "2") ||
      (color === "black" && rank === "7")
    ) {
      const doubleMove = getNewPosition(position, 0, 2 * direction);
      if (!isOccupied(doubleMove, piecePositions)) {
        moves.push(doubleMove);
      }
    }
  }

  // Capture diagonally
  const leftCapture = getNewPosition(position, -1, direction);
  const rightCapture = getNewPosition(position, 1, direction);
  [leftCapture, rightCapture].forEach((captureMove) => {
    if (isOccupied(captureMove, piecePositions)) {
      moves.push(captureMove);
    }
  });

  return moves;
};

const getRookMoves = (position, piecePositions) => {
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  return getSlidingMoves(position, directions, piecePositions);
};

const getKnightMoves = (position, piecePositions) => {
  const offsets = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];
  return offsets
    .map(([fileOffset, rankOffset]) =>
      getNewPosition(position, fileOffset, rankOffset)
    )
    .filter((move) => !isOccupied(move, piecePositions));
};

const getBishopMoves = (position, piecePositions) => {
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return getSlidingMoves(position, directions, piecePositions);
};

const getQueenMoves = (position, piecePositions) => {
  return [
    ...getRookMoves(position, piecePositions),
    ...getBishopMoves(position, piecePositions),
  ];
};

const getKingMoves = (position, piecePositions) => {
  const offsets = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return offsets
    .map(([fileOffset, rankOffset]) =>
      getNewPosition(position, fileOffset, rankOffset)
    )
    .filter((move) => !isOccupied(move, piecePositions));
};

const getSlidingMoves = (position, directions, piecePositions) => {
  const moves = [];
  directions.forEach(([fileOffset, rankOffset]) => {
    let newPosition = getNewPosition(position, fileOffset, rankOffset);
    while (
      isValidPosition(newPosition) &&
      !isOccupied(newPosition, piecePositions)
    ) {
      moves.push(newPosition);
      newPosition = getNewPosition(newPosition, fileOffset, rankOffset);
    }
  });
  return moves;
};
