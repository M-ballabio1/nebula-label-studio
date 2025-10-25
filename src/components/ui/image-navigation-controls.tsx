import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageNavigationControlsProps {
  currentImageName?: string;
  currentImageUrl?: string;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  autoPlayInterval?: number; // in milliseconds, default 2000
}

export const ImageNavigationControls = ({
  currentImageName,
  currentImageUrl,
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext,
  autoPlayInterval = 2000,
}: ImageNavigationControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !onNext) return;
    
    const interval = setInterval(() => {
      if (canGoNext) {
        onNext();
      } else {
        setIsPlaying(false);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, canGoNext, onNext, autoPlayInterval]);

  const truncatePath = (path: string, maxLength: number = 30) => {
    if (path.length <= maxLength) return path;
    const extension = path.split('.').pop();
    const start = path.substring(0, 15);
    return `${start}...${extension ? `.${extension}` : ''}`;
  };

  // Show the component only if we have navigation callbacks or image info
  if (!onPrevious && !onNext && !currentImageName && !currentImageUrl) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        {onPrevious && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
            title="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Play/Pause Button */}
        {onNext && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 w-8 p-0"
            title={isPlaying ? "Pause Auto-Navigation" : "Start Auto-Navigation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        )}

        {/* Next Button */}
        {onNext && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNext}
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
            title="Next Image"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Image Info */}
        {(currentImageName || currentImageUrl) && (
          <div className="mx-3 flex flex-col items-center">
            {currentImageName && (
              <span className="text-sm font-medium bg-muted px-3 py-1.5 rounded">
                {currentImageName}
              </span>
            )}
            {currentImageUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground cursor-help mt-1">
                    {truncatePath(currentImageUrl)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-md break-all">{currentImageUrl}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};