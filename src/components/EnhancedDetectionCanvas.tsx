import { useEffect, useRef, useState } from "react";
import { BoundingBox, Label } from "@/types/annotation";
import { Trash2, ZoomIn, ZoomOut, Copy, RotateCcw, Edit2, Info, Box, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowInfoCard } from "@/components/ui/workflow-info-card";
import { ImageNavigationControls } from "@/components/ui/image-navigation-controls";
import { toast } from "sonner";

interface EnhancedDetectionCanvasProps {
  imageUrl: string;
  boxes: BoundingBox[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddBox: (box: Omit<BoundingBox, "id">) => void;
  onDeleteBox: (id: string) => void;
  onUpdateBox: (id: string, updates: Partial<BoundingBox>) => void;
  onImageLoad?: (dims: { width: number; height: number }) => void;
  onBoxSelect?: (box: BoundingBox | null) => void;
  onBoxHover?: (box: BoundingBox | null) => void;
  activeTool?: "select" | "pan" | "draw" | "erase" | "measure";
  imageTransform?: { rotation: number; flipH: boolean; flipV: boolean };
  imageFilters?: { brightness: number; contrast: number; saturation: number };
  showAnnotations?: boolean;
  lockAnnotations?: boolean;
  currentImageName?: string;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
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
  activeTool = "draw",
  imageTransform = { rotation: 0, flipH: false, flipV: false },
  imageFilters = { brightness: 100, contrast: 100, saturation: 100 },
  showAnnotations = true,
  lockAnnotations = false,
  currentImageName,
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext,
}: EnhancedDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const originalImageDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  
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
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      originalImageDimensionsRef.current = { width: img.width, height: img.height };
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
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && copiedBox && selectedLabelId) {
        onAddBox({ ...copiedBox, x: copiedBox.x + 0.05, y: copiedBox.y + 0.05, labelId: selectedLabelId });
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
    const baseMaxWidth = canvas.width * 0.9;
    const baseMaxHeight = canvas.height * 0.9;
    const scale = Math.min(baseMaxWidth / img.width, baseMaxHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Store image bounds in ref for immediate access
    imageBoundsRef.current = {
      x: offsetX,
      y: offsetY,
      width: scaledWidth,
      height: scaledHeight,
    };

    // Apply transformations and filters
    ctx.save();
    ctx.translate(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2);
    
    // Apply rotation
    ctx.rotate((imageTransform.rotation * Math.PI) / 180);
    
    // Apply flip
    const scaleX = imageTransform.flipH ? -1 : 1;
    const scaleY = imageTransform.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);
    
    // Draw image with filters
    ctx.filter = `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`;
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.filter = 'none';
    
    ctx.restore();

    // Draw existing boxes only if showAnnotations is true
    if (showAnnotations) {
      boxes.forEach((box) => {
      const label = labels.find((l) => l.id === box.labelId);
      if (!label) return;

      // Denormalize box coordinates from (0-1) to current display dimensions
      const displayX = offsetX + box.x * scaledWidth;
      const displayY = offsetY + box.y * scaledHeight;
      const displayWidth = box.width * scaledWidth;
      const displayHeight = box.height * scaledHeight;

      const isSelected = box.id === selectedBoxId;
      const isHovered = box.id === hoveredBoxId;

      ctx.strokeStyle = isSelected ? "#fff" : isHovered ? label.color : label.color;
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2.5 : 2) / zoom;
      ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);

      // Draw resize handles for selected box
      if (isSelected) {
        const handleSize = 8 / zoom;
        const handles = [
          { x: displayX, y: displayY },
          { x: displayX + displayWidth, y: displayY },
          { x: displayX, y: displayY + displayHeight },
          { x: displayX + displayWidth, y: displayY + displayHeight },
          { x: displayX + displayWidth / 2, y: displayY },
          { x: displayX + displayWidth / 2, y: displayY + displayHeight },
          { x: displayX, y: displayY + displayHeight / 2 },
          { x: displayX + displayWidth, y: displayY + displayHeight / 2 },
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
      ctx.fillRect(displayX, displayY - labelHeight, textWidth + padding * 2, labelHeight);

      // Draw label text
      ctx.fillStyle = "#fff";
      ctx.fillText(labelText, displayX + padding, displayY - padding);
    });
    }

    // Draw current box being drawn (in display coordinates)
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

  const getResizeHandle = (box: BoundingBox, point: { x: number; y: number }): ResizeHandle => {
    const imageBounds = imageBoundsRef.current;
    if (!imageBounds) return null;

    // Denormalize box coordinates
    const displayX = imageBounds.x + box.x * imageBounds.width;
    const displayY = imageBounds.y + box.y * imageBounds.height;
    const displayWidth = box.width * imageBounds.width;
    const displayHeight = box.height * imageBounds.height;
    
    const threshold = 8 / zoom;
    
    if (Math.abs(point.x - displayX) < threshold && Math.abs(point.y - displayY) < threshold) return "nw";
    if (Math.abs(point.x - (displayX + displayWidth)) < threshold && Math.abs(point.y - displayY) < threshold) return "ne";
    if (Math.abs(point.x - displayX) < threshold && Math.abs(point.y - (displayY + displayHeight)) < threshold) return "sw";
    if (Math.abs(point.x - (displayX + displayWidth)) < threshold && Math.abs(point.y - (displayY + displayHeight)) < threshold) return "se";
    if (Math.abs(point.x - (displayX + displayWidth / 2)) < threshold && Math.abs(point.y - displayY) < threshold) return "n";
    if (Math.abs(point.x - (displayX + displayWidth / 2)) < threshold && Math.abs(point.y - (displayY + displayHeight)) < threshold) return "s";
    if (Math.abs(point.x - displayX) < threshold && Math.abs(point.y - (displayY + displayHeight / 2)) < threshold) return "w";
    if (Math.abs(point.x - (displayX + displayWidth)) < threshold && Math.abs(point.y - (displayY + displayHeight / 2)) < threshold) return "e";
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (lockAnnotations) return;
    
    // Pan mode or middle mouse button
    if (activeTool === "pan" || e.button === 1 || (e.button === 0 && e.shiftKey)) {
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

    // Check if clicking on a box (denormalize for hit detection)
    const imageBounds = imageBoundsRef.current;
    const clickedBox = imageBounds && (activeTool === "select" || activeTool === "draw") ? boxes.find((box) => {
      const displayX = imageBounds.x + box.x * imageBounds.width;
      const displayY = imageBounds.y + box.y * imageBounds.height;
      const displayWidth = box.width * imageBounds.width;
      const displayHeight = box.height * imageBounds.height;
      
      return coords.x >= displayX &&
        coords.x <= displayX + displayWidth &&
        coords.y >= displayY &&
        coords.y <= displayY + displayHeight;
    }) : null;

    if (clickedBox) {
      setSelectedBoxId(clickedBox.id);
      setMode("move");
      setStartPoint(coords);
      if (onBoxSelect) onBoxSelect(clickedBox);
      return;
    }

    // Start drawing new box only if in draw mode
    if (activeTool === "draw" && selectedLabelId) {
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
      const imageBounds = imageBoundsRef.current;
      if (!box || !imageBounds) return;

      // Denormalize current box for calculation
      const displayX = imageBounds.x + box.x * imageBounds.width;
      const displayY = imageBounds.y + box.y * imageBounds.height;
      const displayWidth = box.width * imageBounds.width;
      const displayHeight = box.height * imageBounds.height;

      const dx = coords.x - startPoint.x;
      const dy = coords.y - startPoint.y;

      let newDisplayX = displayX;
      let newDisplayY = displayY;
      let newDisplayWidth = displayWidth;
      let newDisplayHeight = displayHeight;

      if (resizeHandle.includes("n")) {
        newDisplayY = Math.max(imageBounds.y, displayY + dy);
        newDisplayHeight = displayHeight - (newDisplayY - displayY);
      }
      if (resizeHandle.includes("s")) {
        newDisplayHeight = Math.min(imageBounds.y + imageBounds.height - displayY, displayHeight + dy);
      }
      if (resizeHandle.includes("w")) {
        newDisplayX = Math.max(imageBounds.x, displayX + dx);
        newDisplayWidth = displayWidth - (newDisplayX - displayX);
      }
      if (resizeHandle.includes("e")) {
        newDisplayWidth = Math.min(imageBounds.x + imageBounds.width - displayX, displayWidth + dx);
      }

      // Normalize back to (0-1) coordinates
      const normalizedX = (newDisplayX - imageBounds.x) / imageBounds.width;
      const normalizedY = (newDisplayY - imageBounds.y) / imageBounds.height;
      const normalizedWidth = newDisplayWidth / imageBounds.width;
      const normalizedHeight = newDisplayHeight / imageBounds.height;

      // Ensure minimum size
      if (newDisplayWidth > 5 && newDisplayHeight > 5) {
        onUpdateBox(selectedBoxId, {
          x: normalizedX,
          y: normalizedY,
          width: normalizedWidth,
          height: normalizedHeight,
        });
      }
      setStartPoint(coords);
      return;
    }

    // Handle move
    if (mode === "move" && startPoint && selectedBoxId) {
      const box = boxes.find((b) => b.id === selectedBoxId);
      const imageBounds = imageBoundsRef.current;
      if (!box || !imageBounds) return;

      // Denormalize for calculation
      const displayX = imageBounds.x + box.x * imageBounds.width;
      const displayY = imageBounds.y + box.y * imageBounds.height;
      const displayWidth = box.width * imageBounds.width;
      const displayHeight = box.height * imageBounds.height;

      const dx = coords.x - startPoint.x;
      const dy = coords.y - startPoint.y;

      const newDisplayX = Math.max(imageBounds.x, Math.min(imageBounds.x + imageBounds.width - displayWidth, displayX + dx));
      const newDisplayY = Math.max(imageBounds.y, Math.min(imageBounds.y + imageBounds.height - displayHeight, displayY + dy));

      // Normalize back
      const normalizedX = (newDisplayX - imageBounds.x) / imageBounds.width;
      const normalizedY = (newDisplayY - imageBounds.y) / imageBounds.height;

      onUpdateBox(selectedBoxId, {
        x: normalizedX,
        y: normalizedY,
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

    // Check for hover (denormalize for hit detection)
    const imageBounds = imageBoundsRef.current;
    const hoveredBox = imageBounds ? boxes.find((box) => {
      const displayX = imageBounds.x + box.x * imageBounds.width;
      const displayY = imageBounds.y + box.y * imageBounds.height;
      const displayWidth = box.width * imageBounds.width;
      const displayHeight = box.height * imageBounds.height;
      
      return coords.x >= displayX &&
        coords.x <= displayX + displayWidth &&
        coords.y >= displayY &&
        coords.y <= displayY + displayHeight;
    }) : null;
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

    if (isDrawing && currentBox && selectedLabelId && currentBox.width > 5 && currentBox.height > 5) {
      const imageBounds = imageBoundsRef.current;
      if (imageBounds) {
        // Clamp the box to image bounds
        const clampedBox = {
          x: Math.max(imageBounds.x, currentBox.x),
          y: Math.max(imageBounds.y, currentBox.y),
          width: Math.min(imageBounds.x + imageBounds.width - Math.max(imageBounds.x, currentBox.x), currentBox.width),
          height: Math.min(imageBounds.y + imageBounds.height - Math.max(imageBounds.y, currentBox.y), currentBox.height),
        };
        
        if (clampedBox.width > 5 && clampedBox.height > 5) {
          // Normalize coordinates to (0-1) before saving
          const normalizedBox = {
            x: (clampedBox.x - imageBounds.x) / imageBounds.width,
            y: (clampedBox.y - imageBounds.y) / imageBounds.height,
            width: clampedBox.width / imageBounds.width,
            height: clampedBox.height / imageBounds.height,
            labelId: selectedLabelId,
          };
          onAddBox(normalizedBox);
        }
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => {
      const newZoom = Math.max(0.25, Math.min(5, prev + delta));
      return newZoom;
    });
  };

  const selectedBox = boxes.find((b) => b.id === selectedBoxId);

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Workflow Instructions - Hover to view */}
      <WorkflowInfoCard
        title="Detection Workflow"
        icon={<Tag className="w-4 h-4 text-primary" />}
        steps={[
          { text: "Select a label from the sidebar" },
          { text: "Click and drag on the image to draw a bounding box" },
          { text: "Release to complete the box" },
          { text: "Repeat for multiple objects" },
          { text: "Hover over boxes to see delete option" }
        ]}
        shortcuts={[
          { keys: "Shift+Drag", description: "or Middle Mouse to pan" },
          { keys: "Scroll", description: "to zoom" },
          { keys: "ESC", description: "to cancel drawing" }
        ]}
      />

      <div className="p-3 border-b bg-card flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              setZoom((z) => {
                const newZoom = Math.min(5, z + 0.25);
                toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
                return newZoom;
              });
            }}
            className="h-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              setZoom((z) => {
                const newZoom = Math.max(0.25, z - 0.25);
                toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
                return newZoom;
              });
            }}
            className="h-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => { 
              setZoom(1); 
              setPan({ x: 0, y: 0 }); 
              toast.success("Zoom reset to 100%");
            }}
            className="h-8"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        
        {/* Navigation Controls - Center */}
        <ImageNavigationControls
          currentImageName={currentImageName}
          currentImageUrl={imageUrl}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted">
            Zoom: {Math.round(zoom * 100)}%
          </span>
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
        {isHoveringCanvas && (
          <div className="absolute bottom-4 left-4 z-10">
            <Badge variant="outline" className="text-xs bg-card/95 backdrop-blur-sm shadow-lg animate-fade-in">
              Click and drag to draw • Complete when done • Shift+Drag or Middle mouse to pan
            </Badge>
          </div>
        )}
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
