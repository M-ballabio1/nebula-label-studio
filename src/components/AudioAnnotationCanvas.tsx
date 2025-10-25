import { useEffect, useRef, useState } from "react";
import { AudioSegment, Label } from "@/types/annotation";
import { Play, Pause, SkipBack, SkipForward, Trash2, Info, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface AudioAnnotationCanvasProps {
  audioUrl: string;
  segments: AudioSegment[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddSegment: (segment: Omit<AudioSegment, "id">) => void;
  onDeleteSegment: (id: string) => void;
}

export const AudioAnnotationCanvas = ({
  audioUrl,
  segments,
  labels,
  selectedLabelId,
  onAddSegment,
  onDeleteSegment,
}: AudioAnnotationCanvasProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  useEffect(() => {
    drawWaveform();
  }, [segments, currentTime, duration, hoveredSegmentId]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, 0, width, height);

    // Draw segments
    segments.forEach((segment) => {
      const label = labels.find((l) => l.id === segment.labelId);
      if (!label) return;

      const x = (segment.startTime / duration) * width;
      const w = ((segment.endTime - segment.startTime) / duration) * width;

      ctx.fillStyle = segment.id === hoveredSegmentId 
        ? label.color + "99" 
        : label.color + "66";
      ctx.fillRect(x, 0, w, height);

      // Draw label
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "12px sans-serif";
      ctx.fillText(label.name, x + 4, 20);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;

    if (!selectedLabelId) {
      // Seek
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setSelectionStart(time);
    } else if (selectionStart !== null) {
      const startTime = Math.min(selectionStart, time);
      const endTime = Math.max(selectionStart, time);
      
      if (endTime - startTime > 0.1) {
        onAddSegment({
          startTime,
          endTime,
          labelId: selectedLabelId,
        });
      }
      setIsSelecting(false);
      setSelectionStart(null);
    }
  };

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;

    const hoveredSegment = segments.find(
      (seg) => time >= seg.startTime && time <= seg.endTime
    );
    setHoveredSegmentId(hoveredSegment?.id || null);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 5);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <audio ref={audioRef} src={audioUrl} />
      
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
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-sm">Audio Labeling Workflow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Select a label from the sidebar</li>
                <li>Click on the waveform to mark the start</li>
                <li>Play through the segment</li>
                <li>Click again to mark the end (min 0.1s)</li>
                <li>Hover over segments to delete</li>
              </ol>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Keyboard Shortcuts:</p>
                <div className="text-[10px] text-muted-foreground space-y-1">
                  <p>• <kbd className="px-1 rounded bg-muted">Space</kbd> to play/pause</p>
                  <p>• <kbd className="px-1 rounded bg-muted">←</kbd> skip back 5s</p>
                  <p>• <kbd className="px-1 rounded bg-muted">→</kbd> skip forward 5s</p>
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Status Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedLabel ? (
              <span className="flex items-center gap-2">
                Labeling as:
                <Badge style={{ backgroundColor: selectedLabel.color + "20", color: selectedLabel.color }}>
                  {selectedLabel.name}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">Select a label to start annotating</span>
            )}
          </span>
          {isSelecting && selectionStart !== null && (
            <Badge variant="outline" className="animate-pulse">
              Selection started at {formatTime(selectionStart)} - Click to finish
            </Badge>
          )}
        </div>
      </div>

      {/* Audio Controls */}
      <div className="px-4 pb-4 border-b bg-card/50">
        <div className="flex items-center gap-4 mb-3">
          <Button size="sm" variant="outline" onClick={skipBackward} title="Skip backward 5 seconds (←)">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={togglePlayPause} title="Play/Pause (Space)">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={skipForward} title="Skip forward 5 seconds (→)">
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-sm font-mono text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          {hoveredSegmentId && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteSegment(hoveredSegmentId)}
              title="Delete segment"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => {
            if (audioRef.current) {
              audioRef.current.currentTime = value;
            }
          }}
          className="cursor-pointer"
        />
      </div>

      {/* Waveform Canvas */}
      <div className="flex-1 p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          width={1200}
          height={200}
          className={`w-full h-full border-2 rounded-lg transition-colors ${
            selectedLabelId 
              ? isSelecting 
                ? "cursor-crosshair border-primary" 
                : "cursor-pointer border-primary/50" 
              : "cursor-pointer border-border"
          }`}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasHover}
        />
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <span>{segments.length} segment{segments.length !== 1 ? "s" : ""} created</span>
        <span>Total duration: {formatTime(duration)}</span>
      </div>
    </div>
  );

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration]);
};
