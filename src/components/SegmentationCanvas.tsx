import { useEffect, useRef, useState } from "react";
import { SegmentationPolygon, SegmentationPoint, Label } from "@/types/annotation";
import { Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SegmentationCanvasProps {
  imageUrl: string;
  polygons: SegmentationPolygon[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddPolygon: (polygon: Omit<SegmentationPolygon, "id">) => void;
  onDeletePolygon: (id: string) => void;
}

export const SegmentationCanvas = ({
  imageUrl,
  polygons,
  labels,
  selectedLabelId,
  onAddPolygon,
  onDeletePolygon,
}: SegmentationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPoints, setCurrentPoints] = useState<SegmentationPoint[]>([]);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };
  }, [imageUrl, polygons, currentPoints, hoveredPolygonId]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const img = new Image();
    img.src = imageUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
      ctx.lineWidth = polygon.id === hoveredPolygonId ? 3 : 2;
      ctx.stroke();

      // Draw points
      polygon.points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = label.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
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
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        currentPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = label.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedLabelId) return;

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

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      <div className="p-2 border-b bg-card flex items-center gap-2">
        {currentPoints.length > 0 && (
          <>
            <Button size="sm" variant="default" onClick={handleComplete} className="bg-gradient-hero">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Polygon ({currentPoints.length} points)
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {selectedLabelId
            ? "Click to add points, complete to finish"
            : "Select a label to start drawing"}
        </span>
        {hoveredPolygonId && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeletePolygon(hoveredPolygonId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="cursor-crosshair"
        />
      </div>
    </div>
  );
};
