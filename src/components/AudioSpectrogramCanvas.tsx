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
import WaveSurfer from "wavesurfer.js";
import SpectrogramPlugin from "wavesurfer.js/plugins/spectrogram";

interface AudioSpectrogramCanvasProps {
  audioUrl: string;
  segments: AudioSegment[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddSegment: (segment: Omit<AudioSegment, "id">) => void;
  onDeleteSegment: (id: string) => void;
}

interface SpectrogramSettings {
  colorMap: "viridis" | "grayscale";
  fftSamples: number;
  frequencyMin: number;
  frequencyMax: number;
}

export const AudioSpectrogramCanvas = ({
  audioUrl,
  segments,
  labels,
  selectedLabelId,
  onAddSegment,
  onDeleteSegment,
}: AudioSpectrogramCanvasProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const spectrogramPluginRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [spectrogramZoom, setSpectrogramZoom] = useState(1);
  const [spectrogramSettings, setSpectrogramSettings] = useState<SpectrogramSettings>({
    colorMap: "viridis",
    fftSamples: 512,
    frequencyMin: 0,
    frequencyMax: 8000,
  });

  useEffect(() => {
    if (!waveformRef.current || !spectrogramRef.current) return;

    // Initialize WaveSurfer
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "hsl(var(--muted-foreground))",
      progressColor: "hsl(var(--primary))",
      cursorColor: "hsl(var(--primary))",
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 100,
      barGap: 1,
    });

    // Initialize Spectrogram Plugin
    const colorMapArray = spectrogramSettings.colorMap === "viridis" 
      ? [[68, 1, 84], [72, 40, 120], [62, 73, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]]
      : undefined;
    
    const spectrogramPlugin = SpectrogramPlugin.create({
      container: spectrogramRef.current,
      labels: true,
      height: 300,
      splitChannels: false,
      ...(colorMapArray && { colorMap: colorMapArray }),
    });

    ws.registerPlugin(spectrogramPlugin);
    ws.load(audioUrl);

    // Event listeners
    ws.on("ready", () => {
      setDuration(ws.getDuration());
    });

    ws.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    ws.on("finish", () => {
      setIsPlaying(false);
    });

    ws.on("play", () => {
      setIsPlaying(true);
    });

    ws.on("pause", () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = ws;
    spectrogramPluginRef.current = spectrogramPlugin;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    // Reinitialize when settings change
    if (wavesurferRef.current && spectrogramRef.current && waveformRef.current) {
      wavesurferRef.current.destroy();
      
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "hsl(var(--muted-foreground))",
        progressColor: "hsl(var(--primary))",
        cursorColor: "hsl(var(--primary))",
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 2,
        height: 100,
        barGap: 1,
      });

      const colorMapArray = spectrogramSettings.colorMap === "viridis" 
        ? [[68, 1, 84], [72, 40, 120], [62, 73, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]]
        : undefined;

      const spectrogramPlugin = SpectrogramPlugin.create({
        container: spectrogramRef.current,
        labels: true,
        height: 300 * spectrogramZoom,
        splitChannels: false,
        ...(colorMapArray && { colorMap: colorMapArray }),
      });

      ws.registerPlugin(spectrogramPlugin);
      ws.load(audioUrl);

      ws.on("ready", () => {
        setDuration(ws.getDuration());
      });

      ws.on("timeupdate", (time) => {
        setCurrentTime(time);
      });

      ws.on("finish", () => {
        setIsPlaying(false);
      });

      ws.on("play", () => {
        setIsPlaying(true);
      });

      ws.on("pause", () => {
        setIsPlaying(false);
      });

      wavesurferRef.current = ws;
      spectrogramPluginRef.current = spectrogramPlugin;
    }
  }, [spectrogramSettings, spectrogramZoom]);

  // Handle region selection on waveform/spectrogram
  const handleRegionClick = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws || !selectedLabelId) return;

    if (!isSelecting) {
      setIsSelecting(true);
      const currentTime = ws.getCurrentTime();
      setSelectionStart(currentTime);
      setSelectionEnd(currentTime);
    } else if (selectionStart !== null) {
      const currentTime = ws.getCurrentTime();
      const startTime = Math.min(selectionStart, currentTime);
      const endTime = Math.max(selectionStart, currentTime);
      
      if (endTime - startTime > 0.1) {
        onAddSegment({
          startTime,
          endTime,
          labelId: selectedLabelId,
        });
        toast.success("Audio segment added!");
      }
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [isSelecting, selectionStart, selectedLabelId, onAddSegment]);


  const togglePlayPause = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.playPause();
  };

  const skipBackward = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.skip(-5);
  };

  const skipForward = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.skip(5);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const exportSpectrogramSelection = useCallback(() => {
    if (!spectrogramRef.current || selectionStart === null || selectionEnd === null) {
      toast.error("Please select a region by clicking twice on the waveform");
      return;
    }

    const spectrogramCanvas = spectrogramRef.current.querySelector("canvas");
    if (!spectrogramCanvas) {
      toast.error("Spectrogram not ready");
      return;
    }

    const width = spectrogramCanvas.width;
    const startX = (selectionStart / duration) * width;
    const endX = (selectionEnd / duration) * width;
    const selectionWidth = endX - startX;

    // Create temporary canvas for cropped region
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = selectionWidth;
    tempCanvas.height = spectrogramCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (!tempCtx) return;

    // Copy selection to temp canvas
    tempCtx.drawImage(spectrogramCanvas, startX, 0, selectionWidth, spectrogramCanvas.height, 0, 0, selectionWidth, spectrogramCanvas.height);

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
      
      {/* Workflow Instructions */}
      <WorkflowInfoCard
        title="Audio Spectrogram Workflow"
        icon={<Music className="w-4 h-4 text-primary" />}
        steps={[
          { text: "Select a label from the sidebar" },
          { text: "Click twice on the waveform to mark start and end of a segment" },
          { text: "FFT settings: Adjust frequency range, color scheme, and FFT samples" },
          { text: "Export: Select a region and click Export to save as JPG" },
          { text: "Zoom: Use zoom controls to magnify the spectrogram vertically" }
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
              Selection started at {formatTime(selectionStart)} - Click again to finish
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
                    value={spectrogramSettings.colorMap}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, colorMap: value as "viridis" | "grayscale" })}
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
                  <UILabel>Min Frequency: {spectrogramSettings.frequencyMin} Hz</UILabel>
                  <Slider
                    value={[spectrogramSettings.frequencyMin]}
                    onValueChange={([value]) => setSpectrogramSettings({ ...spectrogramSettings, frequencyMin: value })}
                    max={spectrogramSettings.frequencyMax - 100}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <UILabel>Max Frequency: {spectrogramSettings.frequencyMax} Hz</UILabel>
                  <Slider
                    value={[spectrogramSettings.frequencyMax]}
                    onValueChange={([value]) => setSpectrogramSettings({ ...spectrogramSettings, frequencyMax: value })}
                    min={spectrogramSettings.frequencyMin + 100}
                    max={20000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <UILabel>FFT Samples (higher = more detail, slower)</UILabel>
                  <Select
                    value={spectrogramSettings.fftSamples.toString()}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, fftSamples: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="256">256 (Fast)</SelectItem>
                      <SelectItem value="512">512 (Default)</SelectItem>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="2048">2048</SelectItem>
                      <SelectItem value="4096">4096 (Detailed)</SelectItem>
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
        </div>
        
        <div className="flex items-center gap-2">
          {segments.map((segment) => {
            const label = labels.find(l => l.id === segment.labelId);
            if (!label) return null;
            return (
              <Badge
                key={segment.id}
                style={{ backgroundColor: label.color + "20", color: label.color }}
                className="cursor-pointer hover:opacity-80"
                onClick={() => {
                  const ws = wavesurferRef.current;
                  if (ws) {
                    ws.seekTo(segment.startTime / duration);
                  }
                }}
              >
                {label.name} ({formatTime(segment.startTime)}-{formatTime(segment.endTime)})
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSegment(segment.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => {
            const ws = wavesurferRef.current;
            if (ws) {
              ws.seekTo(value / duration);
            }
          }}
          className="cursor-pointer"
        />
      </div>

      {/* Waveform and Spectrogram */}
      <div className="flex-1 p-4 overflow-auto space-y-4">
        {/* Waveform */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Waveform (Click twice to create segments)</h3>
          <div
            ref={waveformRef}
            className="w-full border-2 rounded-lg cursor-pointer border-border hover:border-primary/50"
            onClick={handleRegionClick}
          />
        </div>

        {/* Spectrogram */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Spectrogram (FFT Analysis)</h3>
          <div
            ref={spectrogramRef}
            className="w-full border-2 rounded-lg border-border"
            style={{ height: `${300 * spectrogramZoom}px` }}
          />
        </div>
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <span>{segments.length} segment{segments.length !== 1 ? "s" : ""} created</span>
        <span>Frequency range: {spectrogramSettings.frequencyMin}-{spectrogramSettings.frequencyMax} Hz | FFT: {spectrogramSettings.fftSamples} samples</span>
        <span>Total duration: {formatTime(duration)}</span>
      </div>
    </div>
  );
};
