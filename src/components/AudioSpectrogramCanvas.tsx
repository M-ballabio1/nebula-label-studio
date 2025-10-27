import { useEffect, useRef, useState, useCallback } from "react";
import { AudioSegment, Label } from "@/types/annotation";
import { Play, Pause, SkipBack, SkipForward, Trash2, Music, Settings, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { WorkflowInfoCard } from "@/components/ui/workflow-info-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label as UILabel } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AudioSpectrogramCanvasProps {
  audioUrl: string;
  segments: AudioSegment[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddSegment: (segment: Omit<AudioSegment, "id">) => void;
  onDeleteSegment: (id: string) => void;
}

interface SpectrogramSettings {
  minFreq: number;
  maxFreq: number;
  colorScheme: "viridis" | "grayscale";
  fftSize: number;
}

export const AudioSpectrogramCanvas = ({
  audioUrl,
  segments,
  labels,
  selectedLabelId,
  onAddSegment,
  onDeleteSegment,
}: AudioSpectrogramCanvasProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [spectrogramZoom, setSpectrogramZoom] = useState(1);
  const [spectrogramSettings, setSpectrogramSettings] = useState<SpectrogramSettings>({
    minFreq: 0,
    maxFreq: 8000,
    colorScheme: "viridis",
    fftSize: 2048,
  });
  const [spectrogramData, setSpectrogramData] = useState<ImageData | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      initAudioContext();
      generateSpectrogram();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    drawWaveform();
  }, [segments, currentTime, duration, hoveredSegmentId, selectionStart, selectionEnd]);

  useEffect(() => {
    if (audioContextRef.current) {
      generateSpectrogram();
    }
  }, [spectrogramSettings, audioUrl]);

  const initAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = spectrogramSettings.fftSize;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
  };

  const generateSpectrogram = async () => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create offline context for spectrogram generation
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const offlineContext = new OfflineAudioContext(2, 44100 * 10, 44100);
      const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
      
      const analyser = offlineContext.createAnalyser();
      analyser.fftSize = spectrogramSettings.fftSize;
      
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(offlineContext.destination);
      
      // Generate spectrogram data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Clear canvas
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      
      // Draw spectrogram columns
      const sliceWidth = width / (audioBuffer.duration * 20);
      let x = 0;
      
      for (let i = 0; i < audioBuffer.duration * 20; i++) {
        analyser.getByteFrequencyData(dataArray);
        
        // Draw frequency bins
        for (let j = 0; j < bufferLength; j++) {
          const freq = (j / bufferLength) * (offlineContext.sampleRate / 2);
          
          // Filter by frequency range
          if (freq < spectrogramSettings.minFreq || freq > spectrogramSettings.maxFreq) continue;
          
          const value = dataArray[j];
          const y = height - (j / bufferLength) * height;
          const color = getColorForValue(value, spectrogramSettings.colorScheme);
          
          ctx.fillStyle = color;
          ctx.fillRect(x, y, sliceWidth, 2);
        }
        
        x += sliceWidth;
      }
      
      const imageData = ctx.getImageData(0, 0, width, height);
      setSpectrogramData(imageData);
    } catch (error) {
      console.error("Error generating spectrogram:", error);
    }
  };

  const getColorForValue = (value: number, scheme: "viridis" | "grayscale"): string => {
    const normalized = value / 255;
    
    if (scheme === "grayscale") {
      const gray = Math.floor(normalized * 255);
      return `rgb(${gray},${gray},${gray})`;
    }
    
    // Viridis color scheme approximation
    const viridis = [
      [68, 1, 84],
      [72, 40, 120],
      [62, 73, 137],
      [49, 104, 142],
      [38, 130, 142],
      [31, 158, 137],
      [53, 183, 121],
      [109, 205, 89],
      [180, 222, 44],
      [253, 231, 37],
    ];
    
    const index = Math.floor(normalized * (viridis.length - 1));
    const color = viridis[index] || viridis[0];
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  };

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
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

    // Draw selection
    if (selectionStart !== null && selectionEnd !== null) {
      const x = (selectionStart / duration) * width;
      const w = ((selectionEnd - selectionStart) / duration) * width;
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(x, 0, w, height);
      
      // Draw selection borders
      ctx.strokeStyle = "rgb(59, 130, 246)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, w, height);
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
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
      setSelectionEnd(time);
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
      setSelectionEnd(null);
    }
  };

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;

    // Update selection end while selecting
    if (isSelecting && selectionStart !== null) {
      setSelectionEnd(time);
    }

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

  const exportSpectrogramSelection = useCallback(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas || selectionStart === null || selectionEnd === null) {
      toast.error("Please select a region first");
      return;
    }

    const width = canvas.width;
    const startX = (selectionStart / duration) * width;
    const endX = (selectionEnd / duration) * width;
    const selectionWidth = endX - startX;

    // Create temporary canvas for cropped region
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = selectionWidth;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (!tempCtx) return;

    // Copy selection to temp canvas
    tempCtx.drawImage(canvas, startX, 0, selectionWidth, canvas.height, 0, 0, selectionWidth, canvas.height);

    // Export as JPG
    tempCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spectrogram_${formatTime(selectionStart)}-${formatTime(selectionEnd)}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Spectrogram exported!");
      }
    }, "image/jpeg", 0.95);
  }, [selectionStart, selectionEnd, duration]);

  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  // Keyboard shortcuts
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

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Workflow Instructions */}
      <WorkflowInfoCard
        title="Audio Spectrogram Workflow"
        icon={<Music className="w-4 h-4 text-primary" />}
        steps={[
          { text: "Select a label from the sidebar" },
          { text: "Click and drag on waveform/spectrogram to select region" },
          { text: "Adjust spectrogram settings in settings menu" },
          { text: "Export selected regions as JPG images" },
          { text: "Use zoom controls for detailed analysis" }
        ]}
        shortcuts={[
          { keys: "Space", description: "to play/pause" },
          { keys: "←", description: "skip back 5s" },
          { keys: "→", description: "skip forward 5s" }
        ]}
      />

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
              Selection started at {formatTime(selectionStart)} - Drag to finish
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
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSpectrogramZoom(Math.max(0.5, spectrogramZoom - 0.25))}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{(spectrogramZoom * 100).toFixed(0)}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSpectrogramZoom(Math.min(3, spectrogramZoom + 0.25))}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" title="Spectrogram settings">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Spectrogram Settings</h4>
                
                <div className="space-y-2">
                  <UILabel>Color Scheme</UILabel>
                  <Select
                    value={spectrogramSettings.colorScheme}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, colorScheme: value as "viridis" | "grayscale" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Color (Viridis)</SelectItem>
                      <SelectItem value="grayscale">Black & White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <UILabel>Min Frequency: {spectrogramSettings.minFreq} Hz</UILabel>
                  <Slider
                    value={[spectrogramSettings.minFreq]}
                    onValueChange={([value]) => setSpectrogramSettings({ ...spectrogramSettings, minFreq: value })}
                    max={spectrogramSettings.maxFreq - 100}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <UILabel>Max Frequency: {spectrogramSettings.maxFreq} Hz</UILabel>
                  <Slider
                    value={[spectrogramSettings.maxFreq]}
                    onValueChange={([value]) => setSpectrogramSettings({ ...spectrogramSettings, maxFreq: value })}
                    min={spectrogramSettings.minFreq + 100}
                    max={20000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <UILabel>FFT Size</UILabel>
                  <Select
                    value={spectrogramSettings.fftSize.toString()}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, fftSize: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512</SelectItem>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="2048">2048 (Default)</SelectItem>
                      <SelectItem value="4096">4096</SelectItem>
                      <SelectItem value="8192">8192</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Selection */}
          <Button
            size="sm"
            variant="outline"
            onClick={exportSpectrogramSelection}
            disabled={selectionStart === null || selectionEnd === null}
            title="Export selected region as JPG"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>

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

      {/* Canvases */}
      <div className="flex-1 p-4 overflow-auto space-y-4">
        {/* Waveform */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Waveform</h3>
          <canvas
            ref={waveformCanvasRef}
            width={1200}
            height={100}
            className="w-full border-2 rounded-lg cursor-pointer border-border hover:border-primary/50"
            onClick={(e) => handleCanvasClick(e, waveformCanvasRef)}
            onMouseMove={(e) => handleCanvasHover(e, waveformCanvasRef)}
          />
        </div>

        {/* Spectrogram */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Spectrogram</h3>
          <canvas
            ref={spectrogramCanvasRef}
            width={1200}
            height={300}
            style={{ transform: `scaleY(${spectrogramZoom})`, transformOrigin: 'top' }}
            className="w-full border-2 rounded-lg cursor-crosshair border-border hover:border-primary/50 transition-transform"
            onClick={(e) => handleCanvasClick(e, spectrogramCanvasRef)}
            onMouseMove={(e) => handleCanvasHover(e, spectrogramCanvasRef)}
          />
        </div>
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <span>{segments.length} segment{segments.length !== 1 ? "s" : ""} created</span>
        <span>Frequency range: {spectrogramSettings.minFreq}-{spectrogramSettings.maxFreq} Hz</span>
        <span>Total duration: {formatTime(duration)}</span>
      </div>
    </div>
  );
};
