import { useEffect, useRef, useState, useCallback } from "react";
import { SegmentationPolygon, SegmentationPoint, Label } from "@/types/annotation";
import { ZoomIn, ZoomOut, Trash2, CheckCircle, X, Info, Pentagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowInfoCard } from "@/components/ui/workflow-info-card";
import { toast } from "sonner";

interface EnhancedSegmentationCanvasProps {
  imageUrl: string;
  polygons: SegmentationPolygon[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddPolygon: (polygon: Omit<SegmentationPolygon, "id">) => void;
  onDeletePolygon: (id: string) => void;
  onImageDimensions?: (dimensions: { original: { width: number; height: number }; normalized: { width: number; height: number } }) => void;
  activeTool?: "select" | "pan" | "draw" | "erase" | "measure";
  imageTransform?: { rotation: number; flipH: boolean; flipV: boolean };
  imageFilters?: { brightness: number; contrast: number; saturation: number };
  showAnnotations?: boolean;
  lockAnnotations?: boolean;
}

export const EnhancedSegmentationCanvas = ({
  imageUrl,
  polygons,
  labels,
  selectedLabelId,
  onAddPolygon,
  onDeletePolygon,
  onImageDimensions,
  activeTool = "draw",
  imageTransform = { rotation: 0, flipH: false, flipV: false },
  imageFilters = { brightness: 100, contrast: 100, saturation: 100 },
  showAnnotations = true,
  lockAnnotations = false,
}: EnhancedSegmentationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPoints, setCurrentPoints] = useState<SegmentationPoint[]>([]);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const imageBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const originalImageDimensionsRef = useRef<{ width: number; height: number } | null>(null);

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
      // Store original dimensions
      originalImageDimensionsRef.current = { width: img.width, height: img.height };
      
      // Calculate scale to fit image in viewport similar to detection canvas
      const baseMaxWidth = canvas.width * 0.95;
      const baseMaxHeight = canvas.height * 0.95;
      const scale = Math.min(baseMaxWidth / img.width, baseMaxHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      if (onImageDimensions) {
        onImageDimensions({
          original: { width: img.width, height: img.height },
          normalized: { width: scaledWidth, height: scaledHeight },
        });
      }

      // Store image bounds in ref for immediate access
      imageBoundsRef.current = {
        x: offsetX,
        y: offsetY,
        width: scaledWidth,
        height: scaledHeight,
      };

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();

      // Apply transformations and filters
      ctx.save();
      ctx.translate(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2);
      
      // Apply rotation
      ctx.rotate((imageTransform.rotation * Math.PI) / 180);
      
      // Apply flip
      const scaleX = imageTransform.flipH ? -1 : 1;
      const scaleY = imageTransform.flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);
      
      // Redraw image with filters
      ctx.filter = `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`;
      ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.filter = 'none';
      
      ctx.restore();

      // Draw polygons after restoring context so they scale with zoom
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw existing polygons only if showAnnotations is true
      if (showAnnotations) {
        polygons.forEach((polygon) => {
        const label = labels.find((l) => l.id === polygon.labelId);
        if (!label || polygon.points.length < 2) return;

        ctx.beginPath();
        // Denormalize first point
        const firstX = offsetX + polygon.points[0].x * scaledWidth;
        const firstY = offsetY + polygon.points[0].y * scaledHeight;
        ctx.moveTo(firstX, firstY);
        
        polygon.points.forEach((point, i) => {
          if (i > 0) {
            // Denormalize each point
            const displayX = offsetX + point.x * scaledWidth;
            const displayY = offsetY + point.y * scaledHeight;
            ctx.lineTo(displayX, displayY);
          }
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
          const displayX = offsetX + point.x * scaledWidth;
          const displayY = offsetY + point.y * scaledHeight;
          ctx.beginPath();
          ctx.arc(displayX, displayY, pointSize, 0, 2 * Math.PI);
          ctx.fillStyle = label.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1 / zoom;
          ctx.stroke();
        });
      });
      }

      // Draw current polygon being created
      if (currentPoints.length > 0 && selectedLabelId) {
        const label = labels.find((l) => l.id === selectedLabelId);
        if (label) {
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          currentPoints.forEach((point, i) => {
            if (i > 0) ctx.lineTo(point.x, point.y);
          });
          
          // Draw preview line to mouse position
          if (mousePos) {
            ctx.lineTo(mousePos.x, mousePos.y);
          }
          
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
          
          // Draw preview point at mouse position
          if (mousePos) {
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, pointSize, 0, 2 * Math.PI);
            ctx.fillStyle = label.color + "80";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };
  };

  const clampToImage = (x: number, y: number) => {
    const imageBounds = imageBoundsRef.current;
    if (!imageBounds) return { x, y };
    return {
      x: Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width, x)),
      y: Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height, y)),
    };
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return clampToImage(x, y);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (lockAnnotations) return;
    
    if (activeTool === "pan" || e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (e.button === 0 && activeTool === "draw" && selectedLabelId && !isPanning) {
      setIsDrawing(true);
      const coords = getCanvasCoordinates(e);
      setCurrentPoints([coords]);
      setMousePos(coords);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setLastPanPos({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && selectedLabelId) {
      const coords = getCanvasCoordinates(e);
      setMousePos(coords);
      
      // Add point if moved enough distance from last point (fluid drawing)
      if (currentPoints.length > 0) {
        const lastPoint = currentPoints[currentPoints.length - 1];
        const distance = Math.sqrt(
          Math.pow(coords.x - lastPoint.x, 2) + Math.pow(coords.y - lastPoint.y, 2)
        );
        // Add point every 8 pixels for smooth drawing
        if (distance > 8 / zoom) {
          setCurrentPoints([...currentPoints, coords]);
        }
      }
    } else if (currentPoints.length > 0 && selectedLabelId) {
      // Update mouse position for preview when not drawing
      const coords = getCanvasCoordinates(e);
      setMousePos(coords);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDrawing(false);
  };

  const handleComplete = () => {
    if (currentPoints.length >= 3 && selectedLabelId) {
      const imageBounds = imageBoundsRef.current;
      if (imageBounds) {
        // Normalize all points before saving (currentPoints are in display coordinates)
        const normalizedPoints = currentPoints.map(p => ({
          x: (p.x - imageBounds.x) / imageBounds.width,
          y: (p.y - imageBounds.y) / imageBounds.height,
        }));
        
        onAddPolygon({
          points: normalizedPoints,
          labelId: selectedLabelId,
        });
      }
      setCurrentPoints([]);
      setMousePos(null);
    }
  };

  const handleCancel = () => {
    setCurrentPoints([]);
  };

  const handleZoomIn = () => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + 0.25, 5);
      toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  };
  
  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.25);
      toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Workflow Instructions - Hover to view */}
      <WorkflowInfoCard
        title="Segmentation Workflow"
        icon={<Pentagon className="w-4 h-4 text-primary" />}
        steps={[
          { text: "Select a label from the sidebar" },
          { text: "Click on the image to place polygon points" },
          { text: "Continue clicking to add more points" },
          { text: "Double-click or press Enter to complete the polygon" },
          { text: "Press Escape to cancel the current polygon" },
          { text: "Hover over polygons to see delete option" }
        ]}
        shortcuts={[
          { keys: "Shift+Drag", description: "or Middle Mouse to pan" },
          { keys: "Scroll", description: "to zoom" },
          { keys: "Enter / Double-click", description: "to complete" },
          { keys: "ESC", description: "to cancel" }
        ]}
      />

      {/* Status Bar */}
      {selectedLabelId && currentPoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-2 shadow-lg animate-fade-in">
            <Pentagon className="w-3 h-3 mr-2" />
            Drawing: {labels.find(l => l.id === selectedLabelId)?.name} ({currentPoints.length} points)
          </Badge>
        </div>
      )}

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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setIsHoveringCanvas(false);
          }}
          onMouseEnter={() => setIsHoveringCanvas(true)}
          className={`w-full h-full ${
            lockAnnotations 
              ? "cursor-not-allowed" 
              : isPanning || activeTool === "pan" 
                ? "cursor-grabbing" 
                : isDrawing 
                  ? "cursor-crosshair" 
                  : activeTool === "select" 
                    ? "cursor-pointer" 
                    : "cursor-crosshair"
          }`}
          style={{ display: 'block' }}
        />
        
        {/* Info overlay - only show when hovering canvas */}
        {isHoveringCanvas && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border text-xs text-muted-foreground animate-fade-in">
            {selectedLabelId
              ? "Click to add points • Double-click or Enter to complete • ESC to cancel"
              : "Select a label to start drawing"}
            {" • "}
            Shift+Drag or Middle mouse to pan
          </div>
        )}
      </div>
    </div>
  );
};