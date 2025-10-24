import { useEffect, useRef, useState } from "react";
import { BoundingBox, Label } from "@/types/annotation";
import { Trash2, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetectionCanvasProps {
  imageUrl: string;
  boxes: BoundingBox[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddBox: (box: Omit<BoundingBox, "id">) => void;
  onDeleteBox: (id: string) => void;
}

export const DetectionCanvas = ({
  imageUrl,
  boxes,
  labels,
  selectedLabelId,
  onAddBox,
  onDeleteBox,
}: DetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Set canvas to match container size
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };
  }, [imageUrl, boxes, currentBox, hoveredBoxId, zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw image
    const img = new Image();
    img.src = imageUrl;
    ctx.drawImage(img, 0, 0, canvas.width / zoom, canvas.height / zoom);

    // Draw existing boxes
    boxes.forEach((box) => {
      const label = labels.find((l) => l.id === box.labelId);
      if (!label) return;

      ctx.strokeStyle = box.id === hoveredBoxId ? "#fff" : label.color;
      ctx.lineWidth = box.id === hoveredBoxId ? 3 : 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label background
      ctx.fillStyle = label.color;
      const labelText = label.name;
      ctx.font = "12px sans-serif";
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(box.x, box.y - 20, textWidth + 8, 20);

      // Draw label text
      ctx.fillStyle = "#fff";
      ctx.fillText(labelText, box.x + 4, box.y - 6);
    });

    // Draw current box being drawn
    if (currentBox && selectedLabelId) {
      const label = labels.find((l) => l.id === selectedLabelId);
      if (label) {
        ctx.strokeStyle = label.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Left for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!selectedLabelId || e.button !== 0) return;
    
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !startPoint || !selectedLabelId) {
      // Check for hover
      const coords = getCanvasCoordinates(e);
      const hoveredBox = boxes.find(
        (box) =>
          coords.x >= box.x &&
          coords.x <= box.x + box.width &&
          coords.y >= box.y &&
          coords.y <= box.y + box.height
      );
      setHoveredBoxId(hoveredBox?.id || null);
      return;
    }

    const coords = getCanvasCoordinates(e);
    setCurrentBox({
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y),
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentBox && selectedLabelId && currentBox.width > 5 && currentBox.height > 5) {
      onAddBox({
        ...currentBox,
        labelId: selectedLabelId,
      });
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      <div className="p-2 border-b bg-card flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(3, z * 1.2))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
          Reset View
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {selectedLabelId
            ? `Drawing: ${labels.find((l) => l.id === selectedLabelId)?.name || ""}`
            : "Select a label to start drawing"}
        </span>
        {hoveredBoxId && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteBox(hoveredBoxId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-crosshair"
          style={{ cursor: isPanning ? "grabbing" : isDrawing ? "crosshair" : "default" }}
        />
      </div>
    </div>
  );
};
