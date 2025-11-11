import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/types/annotation";
import { cn } from "@/lib/utils";

interface VideoAnnotationCanvasProps {
  videoUrl: string;
  labels: Label[];
  selectedLabelId: string | null;
  onFrameExtracted?: (frame: { timestamp: number; frameNumber: number; imageData: string }) => void;
  onAnnotationModeSelect?: (mode: "detection" | "classification" | "segmentation") => void;
}

interface TimeRange {
  start: number;
  end: number;
  labelId: string;
}

export const VideoAnnotationCanvas = ({
  videoUrl,
  labels,
  selectedLabelId,
  onFrameExtracted,
  onAnnotationModeSelect,
}: VideoAnnotationCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps] = useState(30);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  // Generate mock waveform data with peaks for "most-viewed moments"
  useEffect(() => {
    const generateWaveform = () => {
      const points = 200;
      const data: number[] = [];
      for (let i = 0; i < points; i++) {
        // Create peaks at specific intervals to simulate high-energy moments
        const isPeak = i % 30 === 0 || i % 47 === 0 || i % 73 === 0;
        const baseEnergy = Math.random() * 0.3 + 0.2;
        const energy = isPeak ? Math.random() * 0.5 + 0.5 : baseEnergy;
        data.push(energy);
      }
      setWaveformData(data);
    };
    generateWaveform();
  }, []);

  // Draw waveform with energy visualization
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    waveformData.forEach((energy, i) => {
      const x = i * barWidth;
      const barHeight = energy * (height / 2);
      
      // Color based on energy level
      const isPeak = energy > 0.7;
      const hue = isPeak ? "var(--primary)" : "var(--muted-foreground)";
      ctx.fillStyle = isPeak ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)";
      
      // Draw symmetrical bars
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // Draw current time indicator
    const progressX = (currentTime / duration) * width;
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();

    // Draw selected range
    if (selectedRange) {
      const startX = (selectedRange.start / duration) * width;
      const endX = (selectedRange.end / duration) * width;
      ctx.fillStyle = "hsl(var(--primary) / 0.2)";
      ctx.fillRect(startX, 0, endX - startX, height);
      
      // Draw range borders
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    // Draw saved time ranges
    timeRanges.forEach((range) => {
      const label = labels.find((l) => l.id === range.labelId);
      if (!label) return;
      
      const startX = (range.start / duration) * width;
      const endX = (range.end / duration) * width;
      ctx.fillStyle = `${label.color}40`;
      ctx.fillRect(startX, 0, endX - startX, height);
    });
  }, [waveformData, currentTime, duration, selectedRange, timeRanges, labels]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setCurrentFrame(Math.floor(video.currentTime * fps));
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [fps]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekToTime = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  const skipFrames = (direction: "forward" | "backward") => {
    const frameDuration = 1 / fps;
    const newTime = direction === "forward" 
      ? currentTime + frameDuration 
      : currentTime - frameDuration;
    seekToTime(Math.max(0, Math.min(duration, newTime)));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${frames.toString().padStart(2, "0")}`;
  };

  const extractCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    
    onFrameExtracted?.({
      timestamp: currentTime,
      frameNumber: currentFrame,
      imageData,
    });
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    if (e.shiftKey && selectedLabelId) {
      // Range selection mode
      if (!isSelecting) {
        setIsSelecting(true);
        setSelectionStart(clickTime);
        setSelectedRange({ start: clickTime, end: clickTime, labelId: selectedLabelId });
      } else {
        setIsSelecting(false);
        if (selectionStart !== null && selectedRange) {
          const newRange = {
            start: Math.min(selectionStart, clickTime),
            end: Math.max(selectionStart, clickTime),
            labelId: selectedLabelId,
          };
          setTimeRanges([...timeRanges, newRange]);
          setSelectedRange(null);
          setSelectionStart(null);
        }
      }
    } else {
      // Seek mode
      seekToTime(clickTime);
    }
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || selectionStart === null) return;

    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hoverTime = (x / rect.width) * duration;

    setSelectedRange({
      start: Math.min(selectionStart, hoverTime),
      end: Math.max(selectionStart, hoverTime),
      labelId: selectedLabelId || "",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Card className="m-4 overflow-hidden">
        {/* Video Display */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-full max-h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Frame Info Overlay */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-xs text-muted-foreground">Frame</div>
            <div className="text-lg font-mono font-bold">{currentFrame}</div>
          </div>
        </div>

        {/* Waveform / Energy Visualization */}
        <div className="p-4 bg-card">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isSelecting ? "Hold Shift + Click to select range" : "Click to seek"}
            </span>
            <span className="text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <canvas
            ref={waveformCanvasRef}
            className="w-full h-24 cursor-crosshair rounded border border-border"
            onClick={handleWaveformClick}
            onMouseMove={handleWaveformMouseMove}
          />
          
          {/* Time Range Labels */}
          {timeRanges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {timeRanges.map((range, idx) => {
                const label = labels.find((l) => l.id === range.labelId);
                return (
                  <Badge
                    key={idx}
                    style={{ backgroundColor: label?.color }}
                    className="text-xs"
                  >
                    {label?.name}: {formatTime(range.start)} - {formatTime(range.end)}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-card border-t">
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => skipFrames("backward")}
                title="Previous Frame (←)"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={togglePlay}
                className="w-12"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => skipFrames("forward")}
                title="Next Frame (→)"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Timeline Slider */}
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1 / fps}
                onValueChange={([value]) => seekToTime(value)}
                className="cursor-pointer"
              />
            </div>

            {/* Frame Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={extractCurrentFrame}
              >
                Extract Frame
              </Button>
            </div>
          </div>
        </div>

        {/* Annotation Mode Selector */}
        <div className="p-4 bg-card border-t">
          <div className="text-xs text-muted-foreground mb-2">Annotate current frame:</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                extractCurrentFrame();
                onAnnotationModeSelect?.("detection");
              }}
            >
              Detection
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                extractCurrentFrame();
                onAnnotationModeSelect?.("classification");
              }}
            >
              Classification
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                extractCurrentFrame();
                onAnnotationModeSelect?.("segmentation");
              }}
            >
              Segmentation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};