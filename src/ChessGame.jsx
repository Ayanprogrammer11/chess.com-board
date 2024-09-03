import { useState } from "react";
import ChessBoardCanvas from "./ChessBoardCanvas";

function ChessGame() {
  const [piecePositions, setPiecePositions] = useState([
    { piece: "rook_black", position: "a8" },
    { piece: "knight_black", position: "b8" },
    { piece: "bishop_black", position: "c8" },
    { piece: "queen_black", position: "d8" },
    { piece: "king_black", position: "e8" },
    { piece: "bishop_black", position: "f8" },
    { piece: "knight_black", position: "g8" },
    { piece: "rook_black", position: "h8" },
    { piece: "pawn_black", position: "a7" },
    { piece: "pawn_black", position: "b7" },
    { piece: "pawn_black", position: "c7" },
    { piece: "pawn_black", position: "d7" },
    { piece: "pawn_black", position: "e7" },
    { piece: "pawn_black", position: "f7" },
    { piece: "pawn_black", position: "g7" },
    { piece: "pawn_black", position: "h7" },
    { piece: "pawn_white", position: "a2" },
    { piece: "pawn_white", position: "b2" },
    { piece: "pawn_white", position: "c2" },
    { piece: "pawn_white", position: "d2" },
    { piece: "pawn_white", position: "e2" },
    { piece: "pawn_white", position: "f2" },
    { piece: "pawn_white", position: "g2" },
    { piece: "pawn_white", position: "h2" },
    { piece: "rook_white", position: "a1" },
    { piece: "knight_white", position: "b1" },
    { piece: "bishop_white", position: "c1" },
    { piece: "queen_white", position: "d1" },
    { piece: "king_white", position: "e1" },
    { piece: "bishop_white", position: "f1" },
    { piece: "knight_white", position: "g1" },
    { piece: "rook_white", position: "h1" },
  ]);

  const handleMove = (selectedPiece, newPosition) => {
    setPiecePositions((prevPositions) => {
      const updatedPositions = prevPositions.map((piece) =>
        piece === selectedPiece ? { ...piece, position: newPosition } : piece
      );
      return updatedPositions;
    });
  };

  return (
    <div>
      <ChessBoardCanvas piecePositions={piecePositions} onMove={handleMove} />
    </div>
  );
}

export default ChessGame;
