import { useEffect, useRef, useState, useCallback } from "react";
import { getPossibleMoves } from "./chessLogic";

function ChessBoardCanvas({ piecePositions, onMove }) {
  const canvasRef = useRef(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const pieceImagesRef = useRef({});
  const animationRef = useRef(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);

  const CANVAS_SIZE = 2200; // Increased canvas size for higher resolution
  const DISPLAY_SIZE = 550; // Size for display (CSS will scale it down)

  useEffect(() => {
    const loadImages = async () => {
      const uniquePieces = [...new Set(piecePositions.map((p) => p.piece))];
      const imagePromises = uniquePieces.map((piece) => {
        return new Promise((resolve) => {
          const img = new Image();
          const [type, color] = piece.split("_");
          const pieceAbbr = getPieceAbbreviation(type);
          // Using higher resolution images (300px instead of 150px)
          img.src = `https://assets-themes.chess.com/image/ejgfv/300/${color[0]}${pieceAbbr}.png`;
          img.onload = () => {
            pieceImagesRef.current[piece] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image for ${piece}. Using fallback.`);
            resolve();
          };
        });
      });

      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    loadImages();
  }, [piecePositions]);

  const getPieceAbbreviation = (pieceType) => {
    switch (pieceType.toLowerCase()) {
      case "king":
        return "k";
      case "queen":
        return "q";
      case "rook":
        return "r";
      case "bishop":
        return "b";
      case "knight":
        return "n";
      case "pawn":
        return "p";
      default:
        return "";
    }
  };

  const renderBoard = useCallback(() => {
    if (!canvasRef.current || !imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const squareSize = canvas.width / 8;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rendering the board
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        ctx.fillStyle = (row + column) % 2 === 0 ? "#ebecd1" : "#749454";
        ctx.fillRect(
          column * squareSize,
          row * squareSize,
          squareSize,
          squareSize
        );
      }
    }

    // Rendering possible moves
    possibleMoves.forEach((move) => {
      const { x, y } = getCoordinates(move);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.arc(
        x * squareSize + squareSize / 2,
        y * squareSize + squareSize / 2,
        squareSize / 6,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Rendering the pieces
    piecePositions.forEach((item) => {
      if (animatingPiece && item.position === animatingPiece.startPos) {
        return; // Skip rendering the piece at its original position during animation
      }
      const { x, y } = getCoordinates(item.position);
      renderPiece(ctx, item.piece, x, y, squareSize);
    });

    // Render the animating piece if there is one
    if (animatingPiece) {
      renderPiece(
        ctx,
        animatingPiece.piece,
        animatingPiece.currentX,
        animatingPiece.currentY,
        squareSize
      );
    }
  }, [piecePositions, possibleMoves, animatingPiece, imagesLoaded]);

  const renderPiece = (ctx, piece, x, y, size) => {
    const pieceImage = pieceImagesRef.current[piece];
    if (pieceImage && pieceImage.complete && pieceImage.naturalHeight !== 0) {
      ctx.drawImage(pieceImage, x * size, y * size, size, size);
    } else {
      renderFallbackPiece(ctx, piece, x, y, size);
    }
  };

  const renderFallbackPiece = (ctx, piece, x, y, size) => {
    const [type, color] = piece.split("_");
    ctx.fillStyle = color === "white" ? "#fff" : "#000";
    ctx.strokeStyle = color === "white" ? "#000" : "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x * size + size / 2, y * size + size / 2, size / 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color === "white" ? "#000" : "#fff";
    ctx.font = `${size / 3}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      type[0].toUpperCase(),
      x * size + size / 2,
      y * size + size / 2
    );
  };

  const getCoordinates = (position) => {
    const file = position[0].charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(position[1], 10);
    return { x: file, y: rank };
  };

  const getPositionFromCoordinates = (x, y) => {
    const file = String.fromCharCode(97 + x);
    const rank = 8 - y;
    return `${file}${rank}`;
  };

  const animateMove = useCallback(
    (piece, startPos, endPos) => {
      const startCoords = getCoordinates(startPos);
      const endCoords = getCoordinates(endPos);
      let startTime;
      const animationDuration = 300; // ms

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        const ratio = Math.min(progress / animationDuration, 1);
        const currentX = startCoords.x + (endCoords.x - startCoords.x) * ratio;
        const currentY = startCoords.y + (endCoords.y - startCoords.y) * ratio;

        setAnimatingPiece({
          piece: piece.piece,
          startPos,
          endPos,
          currentX,
          currentY,
        });

        if (progress < animationDuration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatingPiece(null);
          onMove(piece, endPos);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [onMove]
  );

  const handleClick = useCallback(
    (e) => {
      if (animatingPiece) return; // Prevent clicks during animation

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const squareSize = CANVAS_SIZE / 8;
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;

      const x = Math.floor(((e.clientX - rect.left) * scaleX) / squareSize);
      const y = Math.floor(((e.clientY - rect.top) * scaleY) / squareSize);

      const clickedPosition = getPositionFromCoordinates(x, y);

      if (selectedPiece && possibleMoves.includes(clickedPosition)) {
        animateMove(selectedPiece, selectedPiece.position, clickedPosition);
        setSelectedPiece(null);
        setPossibleMoves([]);
      } else {
        const clickedPiece = piecePositions.find(
          (p) => p.position === clickedPosition
        );

        if (clickedPiece) {
          setSelectedPiece(clickedPiece);
          const moves = getPossibleMoves(
            clickedPiece.piece,
            clickedPiece.position,
            piecePositions
          );
          setPossibleMoves(moves);
        } else {
          setSelectedPiece(null);
          setPossibleMoves([]);
        }
      }
    },
    [selectedPiece, possibleMoves, piecePositions, animateMove, animatingPiece]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [handleClick]);

  useEffect(() => {
    renderBoard();
  }, [renderBoard]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ width: `${DISPLAY_SIZE}px`, height: `${DISPLAY_SIZE}px` }}
    ></canvas>
  );
}

export default ChessBoardCanvas;
