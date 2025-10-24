import { useEffect, useRef, useState } from "react";
import { SegmentationPolygon, SegmentationPoint, Label } from "@/types/annotation";
import { ZoomIn, ZoomOut, Trash2, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedSegmentationCanvasProps {
  imageUrl: string;
  polygons: SegmentationPolygon[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddPolygon: (polygon: Omit<SegmentationPolygon, "id">) => void;
  onDeletePolygon: (id: string) => void;
  onImageDimensions?: (dimensions: { original: { width: number; height: number }; normalized: { width: number; height: number } }) => void;
}

export const EnhancedSegmentationCanvas = ({
  imageUrl,
  polygons,
  labels,
  selectedLabelId,
  onAddPolygon,
  onDeletePolygon,
  onImageDimensions,
}: EnhancedSegmentationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPoints, setCurrentPoints] = useState<SegmentationPoint[]>([]);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawCanvas();
  }, [imageUrl, polygons, currentPoints, hoveredPolygonId, zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply zoom and pan
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw image
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Calculate scale to fit image in viewport similar to detection canvas
      const maxWidth = (canvas.width / zoom) * 0.95;
      const maxHeight = (canvas.height / zoom) * 0.95;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = ((canvas.width / zoom) - scaledWidth) / 2;
      const offsetY = ((canvas.height / zoom) - scaledHeight) / 2;

      if (onImageDimensions) {
        onImageDimensions({
          original: { width: img.width, height: img.height },
          normalized: { width: scaledWidth, height: scaledHeight },
        });
      }

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw polygons after restoring context so they scale with zoom
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw existing polygons
      polygons.forEach((polygon) => {
        const label = labels.find((l) => l.id === polygon.labelId);
        if (!label || polygon.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();

        // Fill with semi-transparent color
        ctx.fillStyle = label.color + "40";
        ctx.fill();

        // Stroke
        ctx.strokeStyle = polygon.id === hoveredPolygonId ? "#fff" : label.color;
        ctx.lineWidth = (polygon.id === hoveredPolygonId ? 3 : 2) / zoom;
        ctx.stroke();

        // Draw points
        const pointSize = 4 / zoom;
        polygon.points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
          ctx.fillStyle = label.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1 / zoom;
          ctx.stroke();
        });
      });

      // Draw current polygon being created
      if (currentPoints.length > 0 && selectedLabelId) {
        const label = labels.find((l) => l.id === selectedLabelId);
        if (label) {
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          currentPoints.forEach((point, i) => {
            if (i > 0) ctx.lineTo(point.x, point.y);
          });
          ctx.strokeStyle = label.color;
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([5 / zoom, 5 / zoom]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw points
          const pointSize = 4 / zoom;
          currentPoints.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
            ctx.fillStyle = label.color;
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();
          });
        }
      }

      ctx.restore();
    };
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedLabelId || isPanning || e.shiftKey) return;

    const coords = getCanvasCoordinates(e);
    setCurrentPoints([...currentPoints, coords]);
  };

  const handleComplete = () => {
    if (currentPoints.length >= 3 && selectedLabelId) {
      onAddPolygon({
        points: currentPoints,
        labelId: selectedLabelId,
      });
      setCurrentPoints([]);
    }
  };

  const handleCancel = () => {
    setCurrentPoints([]);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5));

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
        <Button size="sm" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button size="sm" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        {currentPoints.length > 0 && (
          <>
            <div className="w-px h-6 bg-border mx-2" />
            <Button size="sm" onClick={handleComplete} className="bg-primary text-primary-foreground">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete ({currentPoints.length})
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {hoveredPolygonId && (
          <>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeletePolygon(hoveredPolygonId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full relative">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-crosshair"}`}
          style={{ display: 'block' }}
        />
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border text-xs text-muted-foreground">
        {selectedLabelId
          ? "Click to add points • Complete when done"
          : "Select a label to start drawing"}
        <br />
        Shift+Drag or Middle mouse to pan
      </div>
    </div>
  );
};