import { Label, ClassificationTag } from "@/types/annotation";
import { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Info, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowInfoCard } from "@/components/ui/workflow-info-card";

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

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions to fit canvas while maintaining aspect ratio
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Workflow Instructions - Hover to view */}
      <WorkflowInfoCard
        title="Classification Workflow"
        icon={<Tag className="w-4 h-4 text-primary" />}
        steps={[
          { text: "View the entire image to understand the content" },
          { text: "Click on labels in the sidebar to assign tags" },
          { text: "Multiple tags can be assigned to a single image" },
          { text: "Click again to remove a tag" },
          { text: "Use zoom controls to inspect details if needed" }
        ]}
        shortcuts={[
          { keys: "Classification", description: "assigns labels to the entire image" },
          { keys: "Use for categorizing", description: "images by theme or content" }
        ]}
      />

      <div ref={containerRef} className="flex-1 relative bg-muted/20 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ 
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block"
          }}
        />
      </div>
    </div>
  );
};
