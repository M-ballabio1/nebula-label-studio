import { ChevronLeft, ChevronRight, Play, Pause, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface ImageNavigationBarProps {
  currentImageName: string;
  currentImagePath: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

export const ImageNavigationBar = ({
  currentImageName,
  currentImagePath,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ImageNavigationBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (canGoNext) {
        onNext();
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, canGoNext, onNext]);

  const truncatePath = (path: string, maxLength: number = 30) => {
    if (path.length <= maxLength) return path;
    const extension = path.split('.').pop();
    const start = path.substring(0, 15);
    return `${start}...${extension}`;
  };

  return (
    <TooltipProvider>
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 w-9 p-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onNext}
            disabled={!canGoNext}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {(onZoomIn || onZoomOut || onZoomReset) && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                size="sm"
                variant="ghost"
                onClick={onZoomOut}
                className="h-9 w-9 p-0"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium text-muted-foreground min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onZoomIn}
                className="h-9 w-9 p-0"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onZoomReset}
                className="h-9 w-9 p-0"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">{currentImageName}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">
                ({truncatePath(currentImagePath)})
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-md break-all">{currentImagePath}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
