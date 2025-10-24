import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImageNavigationBarProps {
  currentImageName: string;
  currentImagePath: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageNavigationBar = ({
  currentImageName,
  currentImagePath,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
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

  return (
    <div className="h-14 border-b bg-card flex items-center justify-center px-4 gap-4">
      <Button
        size="sm"
        variant="secondary"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="h-9"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={() => setIsPlaying(!isPlaying)}
        className="h-9"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <Button
        size="sm"
        variant="secondary"
        onClick={onNext}
        disabled={!canGoNext}
        className="h-9"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <span className="text-sm font-medium">{currentImageName}</span>
        <span className="text-xs text-muted-foreground">({currentImagePath})</span>
      </div>
    </div>
  );
};
