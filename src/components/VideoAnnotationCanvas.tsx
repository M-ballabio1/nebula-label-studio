import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Film, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoFrame } from "@/types/video";

interface VideoAnnotationCanvasProps {
  videoUrl: string;
  frames: VideoFrame[];
  currentFrameId: string | null;
  onFrameSelect: (frameId: string) => void;
  onExtractFrames: () => void;
  fps?: number;
}

export const VideoAnnotationCanvas = ({
  videoUrl,
  frames,
  currentFrameId,
  onFrameSelect,
  onExtractFrames,
  fps = 30,
}: VideoAnnotationCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showFrameGrid, setShowFrameGrid] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 1 / fps);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 1 / fps);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const currentFrame = frames.find((f) => f.id === currentFrameId);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-3 border-b bg-card flex items-center gap-2 flex-wrap">
        {frames.length === 0 && (
          <Button
            size="sm"
            onClick={onExtractFrames}
            className="h-8 bg-primary text-primary-foreground"
          >
            <Film className="w-4 h-4 mr-1" />
            Extract Frames
          </Button>
        )}
        
        <div className="flex-1" />
        
        {frames.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted">
              {frames.length} frames extracted
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-muted/20 flex items-center justify-center p-4">
        {currentFrame ? (
          <img
            src={currentFrame.imageUrl}
            alt={`Frame ${currentFrame.frameNumber}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        )}
      </div>

      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="secondary" onClick={skipBackward}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={togglePlay} className="bg-primary text-primary-foreground">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="secondary" onClick={skipForward}>
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground min-w-[80px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.01}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs font-mono text-muted-foreground min-w-[80px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {currentFrame && (
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Viewing Frame {currentFrame.frameNumber} at {formatTime(currentFrame.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};
