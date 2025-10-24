import { useEffect, useRef, useState } from "react";
import { BoundingBox, Label } from "@/types/annotation";
import { Trash2, ZoomIn, ZoomOut, Copy, RotateCcw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EnhancedDetectionCanvasProps {
  imageUrl: string;
  boxes: BoundingBox[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddBox: (box: Omit<BoundingBox, "id">) => void;
  onDeleteBox: (id: string) => void;
  onUpdateBox: (id: string, box: Partial<BoundingBox>) => void;
  onImageLoad?: (dimensions: { width: number; height: number }) => void;
  onBoxSelect?: (box: BoundingBox | null) => void;
  onBoxHover?: (box: BoundingBox | null) => void;
}

type InteractionMode = "draw" | "select" | "move" | "resize";
type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

export const EnhancedDetectionCanvas = ({
  imageUrl,
  boxes,
  labels,
  selectedLabelId,
  onAddBox,
  onDeleteBox,
  onUpdateBox,
  onImageLoad,
  onBoxSelect,
  onBoxHover,
}: EnhancedDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<InteractionMode>("draw");
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [copiedBox, setCopiedBox] = useState<Omit<BoundingBox, "id"> | null>(null);
  const [imageBounds, setImageBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      if (onImageLoad) {
        onImageLoad({ width: img.width, height: img.height });
      }
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawCanvas();
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [boxes, currentBox, selectedBoxId, hoveredBoxId, zoom, pan, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedBoxId) {
        onDeleteBox(selectedBoxId);
        setSelectedBoxId(null);
      }
      if (e.key === "Escape") {
        setSelectedBoxId(null);
        setMode("draw");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedBoxId) {
        const box = boxes.find((b) => b.id === selectedBoxId);
        if (box) {
          setCopiedBox({ x: box.x, y: box.y, width: box.width, height: box.height, labelId: box.labelId });
          toast.success("Box copied");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && copiedBox) {
        onAddBox({ ...copiedBox, x: copiedBox.x + 20, y: copiedBox.y + 20 });
        toast.success("Box pasted");
      }
      // Hotkeys for labels
      const label = labels.find((l) => l.hotkey === e.key);
      if (label && selectedBoxId) {
        onUpdateBox(selectedBoxId, { labelId: label.id });
        toast.success(`Changed to ${label.name}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBoxId, boxes, labels, copiedBox]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Calculate image dimensions to fit canvas while maintaining aspect ratio
    const maxWidth = canvas.width / zoom * 0.9;
    const maxHeight = canvas.height / zoom * 0.9;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (canvas.width / zoom - scaledWidth) / 2;
    const offsetY = (canvas.height / zoom - scaledHeight) / 2;

    // Store image bounds for coordinate clamping
    setImageBounds({
      x: offsetX,
      y: offsetY,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Draw image
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw existing boxes - they scale with zoom automatically due to ctx.scale()
    boxes.forEach((box) => {
      const label = labels.find((l) => l.id === box.labelId);
      if (!label) return;

      const isSelected = box.id === selectedBoxId;
      const isHovered = box.id === hoveredBoxId;

      ctx.strokeStyle = isSelected ? "#fff" : isHovered ? label.color : label.color;
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2.5 : 2) / zoom;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw resize handles for selected box
      if (isSelected) {
        const handleSize = 8 / zoom;
        const handles = [
          { x: box.x, y: box.y },
          { x: box.x + box.width, y: box.y },
          { x: box.x, y: box.y + box.height },
          { x: box.x + box.width, y: box.y + box.height },
          { x: box.x + box.width / 2, y: box.y },
          { x: box.x + box.width / 2, y: box.y + box.height },
          { x: box.x, y: box.y + box.height / 2 },
          { x: box.x + box.width, y: box.y + box.height / 2 },
        ];
        ctx.fillStyle = "#fff";
        handles.forEach((handle) => {
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
      }

      // Draw label background
      ctx.fillStyle = label.color;
      const labelText = label.name;
      const fontSize = 12 / zoom;
      ctx.font = `${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(labelText).width;
      const labelHeight = 20 / zoom;
      const padding = 4 / zoom;
      ctx.fillRect(box.x, box.y - labelHeight, textWidth + padding * 2, labelHeight);

      // Draw label text
      ctx.fillStyle = "#fff";
      ctx.fillText(labelText, box.x + padding, box.y - padding);
    });

    // Draw current box being drawn
    if (currentBox && selectedLabelId) {
      const label = labels.find((l) => l.id === selectedLabelId);
      if (label) {
        ctx.strokeStyle = label.color;
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  };

  const clampToImage = (x: number, y: number) => {
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

  const getResizeHandle = (box: BoundingBox, point: { x: number; y: number }): ResizeHandle => {
    const threshold = 8 / zoom;
    
    if (Math.abs(point.x - box.x) < threshold && Math.abs(point.y - box.y) < threshold) return "nw";
    if (Math.abs(point.x - (box.x + box.width)) < threshold && Math.abs(point.y - box.y) < threshold) return "ne";
    if (Math.abs(point.x - box.x) < threshold && Math.abs(point.y - (box.y + box.height)) < threshold) return "sw";
    if (Math.abs(point.x - (box.x + box.width)) < threshold && Math.abs(point.y - (box.y + box.height)) < threshold) return "se";
    if (Math.abs(point.x - (box.x + box.width / 2)) < threshold && Math.abs(point.y - box.y) < threshold) return "n";
    if (Math.abs(point.x - (box.x + box.width / 2)) < threshold && Math.abs(point.y - (box.y + box.height)) < threshold) return "s";
    if (Math.abs(point.x - box.x) < threshold && Math.abs(point.y - (box.y + box.height / 2)) < threshold) return "w";
    if (Math.abs(point.x - (box.x + box.width)) < threshold && Math.abs(point.y - (box.y + box.height / 2)) < threshold) return "e";
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;
    
    const coords = getCanvasCoordinates(e);

    // Check if clicking on selected box's resize handle
    if (selectedBoxId) {
      const box = boxes.find((b) => b.id === selectedBoxId);
      if (box) {
        const handle = getResizeHandle(box, coords);
        if (handle) {
          setResizeHandle(handle);
          setStartPoint(coords);
          return;
        }
      }
    }

    // Check if clicking on a box
    const clickedBox = boxes.find(
      (box) =>
        coords.x >= box.x &&
        coords.x <= box.x + box.width &&
        coords.y >= box.y &&
        coords.y <= box.y + box.height
    );

    if (clickedBox) {
      setSelectedBoxId(clickedBox.id);
      setMode("move");
      setStartPoint(coords);
      if (onBoxSelect) onBoxSelect(clickedBox);
      return;
    }

    // Start drawing new box
    if (selectedLabelId) {
      setIsDrawing(true);
      setStartPoint(coords);
      setSelectedBoxId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const coords = getCanvasCoordinates(e);

    // Handle resize
    if (resizeHandle && startPoint && selectedBoxId) {
      const box = boxes.find((b) => b.id === selectedBoxId);
      if (!box || !imageBounds) return;

      const dx = coords.x - startPoint.x;
      const dy = coords.y - startPoint.y;

      let newBox = { ...box };

      if (resizeHandle.includes("n")) {
        newBox.y = Math.max(imageBounds.y, box.y + dy);
        newBox.height = box.height - (newBox.y - box.y);
      }
      if (resizeHandle.includes("s")) {
        newBox.height = Math.min(imageBounds.y + imageBounds.height - box.y, box.height + dy);
      }
      if (resizeHandle.includes("w")) {
        newBox.x = Math.max(imageBounds.x, box.x + dx);
        newBox.width = box.width - (newBox.x - box.x);
      }
      if (resizeHandle.includes("e")) {
        newBox.width = Math.min(imageBounds.x + imageBounds.width - box.x, box.width + dx);
      }

      // Ensure minimum size
      if (newBox.width > 5 && newBox.height > 5) {
        onUpdateBox(selectedBoxId, newBox);
      }
      setStartPoint(coords);
      return;
    }

    // Handle move
    if (mode === "move" && startPoint && selectedBoxId) {
      const box = boxes.find((b) => b.id === selectedBoxId);
      if (!box || !imageBounds) return;

      const dx = coords.x - startPoint.x;
      const dy = coords.y - startPoint.y;

      const newX = Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width - box.width, box.x + dx));
      const newY = Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height - box.height, box.y + dy));

      onUpdateBox(selectedBoxId, {
        x: newX,
        y: newY,
      });
      setStartPoint(coords);
      return;
    }

    // Handle drawing
    if (isDrawing && startPoint && selectedLabelId) {
      setCurrentBox({
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        width: Math.abs(coords.x - startPoint.x),
        height: Math.abs(coords.y - startPoint.y),
      });
      return;
    }

    // Check for hover
    const hoveredBox = boxes.find(
      (box) =>
        coords.x >= box.x &&
        coords.x <= box.x + box.width &&
        coords.y >= box.y &&
        coords.y <= box.y + box.height
    );
    setHoveredBoxId(hoveredBox?.id || null);
    if (onBoxHover) onBoxHover(hoveredBox || null);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (resizeHandle) {
      setResizeHandle(null);
      setStartPoint(null);
      return;
    }

    if (mode === "move") {
      setMode("draw");
      setStartPoint(null);
      return;
    }

    if (isDrawing && currentBox && selectedLabelId && currentBox.width > 5 && currentBox.height > 5 && imageBounds) {
      // Clamp the box to image bounds
      const clampedBox = {
        x: Math.max(imageBounds.x, currentBox.x),
        y: Math.max(imageBounds.y, currentBox.y),
        width: Math.min(imageBounds.x + imageBounds.width - Math.max(imageBounds.x, currentBox.x), currentBox.width),
        height: Math.min(imageBounds.y + imageBounds.height - Math.max(imageBounds.y, currentBox.y), currentBox.height),
      };
      
      if (clampedBox.width > 5 && clampedBox.height > 5) {
        onAddBox({
          ...clampedBox,
          labelId: selectedLabelId,
        });
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  };

  const selectedBox = boxes.find((b) => b.id === selectedBoxId);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-3 border-b bg-card flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => setZoom((z) => Math.min(5, z * 1.2))}
            className="h-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}
            className="h-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="h-8"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted">
            Zoom: {Math.round(zoom * 100)}%
          </span>
          {selectedLabelId && (
            <span className="text-xs font-medium text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">
              Drawing: {labels.find((l) => l.id === selectedLabelId)?.name}
            </span>
          )}
        </div>
        
        {selectedBox && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setCopiedBox({
                  x: selectedBox.x,
                  y: selectedBox.y,
                  width: selectedBox.width,
                  height: selectedBox.height,
                  labelId: selectedBox.labelId,
                });
                toast.success("Box copied");
              }}
              className="h-8"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onDeleteBox(selectedBoxId!);
                setSelectedBoxId(null);
              }}
              className="h-8"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
      <div ref={containerRef} className="flex-1 relative bg-muted/20 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ 
            cursor: isPanning ? "grabbing" : 
                    resizeHandle ? "nwse-resize" : 
                    mode === "move" ? "move" : 
                    "crosshair",
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block"
          }}
        />
      </div>
    </div>
  );
};
