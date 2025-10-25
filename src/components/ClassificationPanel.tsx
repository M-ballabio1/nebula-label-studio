import { Label, ClassificationTag } from "@/types/annotation";
import { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Info, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ClassificationPanelProps {
  imageUrl: string;
  tags: ClassificationTag[];
  labels: Label[];
  onToggleTag: (labelId: string) => void;
  onImageDimensions?: (dimensions: { original: { width: number; height: number }; normalized: { width: number; height: number } }) => void;
}

export const ClassificationPanel = ({
  imageUrl,
  onImageDimensions,
}: ClassificationPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      if (onImageDimensions) {
        onImageDimensions({
          original: { width: img.width, height: img.height },
          normalized: { width: img.width, height: img.height },
        });
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
  }, [zoom, pan]);

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

    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  };

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Workflow Instructions - Hover to view */}
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-4 right-4 z-10 h-9 w-9 p-0 bg-card/95 backdrop-blur-sm shadow-lg"
          >
            <Info className="w-4 h-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-sm">Classification Workflow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>View the entire image to understand the content</li>
                <li>Click on labels in the sidebar to assign tags</li>
                <li>Multiple tags can be assigned to a single image</li>
                <li>Click again to remove a tag</li>
                <li>Use zoom controls to inspect details if needed</li>
              </ol>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Tips:</p>
                <div className="text-[10px] text-muted-foreground space-y-1">
                  <p>• Classification assigns labels to the entire image</p>
                  <p>• Use for categorizing images by theme or content</p>
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

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
          {isHoveringCanvas && (
            <Badge variant="outline" className="text-xs">
              Shift+Drag or Middle mouse to pan • Scroll to zoom
            </Badge>
          )}
          <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative bg-muted/20 flex items-center justify-center">
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
            cursor: isPanning ? "grabbing" : "default",
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block"
          }}
        />
      </div>
    </div>
  );
};
