import { useEffect, useRef, useState } from "react";
import { AudioSegment, Label } from "@/types/annotation";
import { Play, Pause, SkipBack, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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

  return (
    <div className="flex-1 flex flex-col bg-background">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-4 mb-4">
          <Button size="sm" variant="outline" onClick={skipBackward}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={skipForward}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          {hoveredSegmentId && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteSegment(hoveredSegmentId)}
            >
              <Trash2 className="w-4 h-4" />
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
        />
      </div>

      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          width={1200}
          height={200}
          className="w-full h-full cursor-pointer border rounded-lg"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasHover}
        />
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {selectedLabelId
            ? isSelecting
              ? "Click again to finish selection"
              : "Click to start segment selection"
            : "Select a label to annotate, or click to seek"}
        </div>
      </div>
    </div>
  );
};
