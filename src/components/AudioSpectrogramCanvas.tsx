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
  colorMap: "spectral" | "hot" | "cool" | "viridis" | "plasma" | "magma" | "grayscale" | "rainbow";
  fftSamples: number;
  frequencyMin: number;
  frequencyMax: number;
  windowFunction: "hann" | "hamming" | "blackman" | "bartlett" | "rectangular";
  overlap: number;
}

// Generate professional colormap like Audacity
const generateColorMap = (type: SpectrogramSettings["colorMap"]): number[][] => {
  const colors: number[][] = [];
  
  const interpolateColor = (color1: number[], color2: number[], fraction: number): number[] => {
    return [
      Math.round(color1[0] + (color2[0] - color1[0]) * fraction),
      Math.round(color1[1] + (color2[1] - color1[1]) * fraction),
      Math.round(color1[2] + (color2[2] - color1[2]) * fraction),
      255
    ];
  };

  const createGradient = (colorStops: number[][]): number[][] => {
    const result: number[][] = [];
    const segmentSize = 256 / (colorStops.length - 1);
    
    for (let i = 0; i < 256; i++) {
      const segment = Math.floor(i / segmentSize);
      const lowerIndex = Math.min(segment, colorStops.length - 2);
      const upperIndex = lowerIndex + 1;
      const fraction = (i - lowerIndex * segmentSize) / segmentSize;
      
      result.push(interpolateColor(colorStops[lowerIndex], colorStops[upperIndex], fraction));
    }
    return result;
  };

  switch (type) {
    case "spectral":
      // Audacity's Spectral colormap - blue to green to yellow to red
      return createGradient([
        [0, 0, 128],     // Dark blue
        [0, 100, 255],   // Bright blue
        [0, 255, 255],   // Cyan
        [0, 255, 0],     // Green
        [255, 255, 0],   // Yellow
        [255, 128, 0],   // Orange
        [255, 0, 0],     // Red
        [128, 0, 0]      // Dark red
      ]);

    case "hot":
      // Hot colormap - black to red to yellow to white
      return createGradient([
        [0, 0, 0],       // Black
        [128, 0, 0],     // Dark red
        [255, 0, 0],     // Red
        [255, 128, 0],   // Orange
        [255, 255, 0],   // Yellow
        [255, 255, 128], // Light yellow
        [255, 255, 255]  // White
      ]);

    case "cool":
      // Cool colormap - cyan to magenta
      return createGradient([
        [0, 255, 255],   // Cyan
        [128, 128, 255], // Light blue
        [255, 0, 255]    // Magenta
      ]);

    case "viridis":
      // Viridis colormap - perceptually uniform
      return createGradient([
        [68, 1, 84],
        [59, 82, 139],
        [33, 145, 140],
        [94, 201, 98],
        [253, 231, 37]
      ]);

    case "plasma":
      // Plasma colormap
      return createGradient([
        [13, 8, 135],
        [75, 3, 161],
        [133, 5, 167],
        [187, 21, 162],
        [238, 58, 148],
        [253, 114, 114],
        [248, 189, 67],
        [240, 249, 33]
      ]);

    case "magma":
      // Magma colormap
      return createGradient([
        [0, 0, 4],
        [40, 11, 84],
        [101, 21, 110],
        [159, 42, 99],
        [212, 72, 66],
        [245, 125, 33],
        [250, 193, 39],
        [252, 253, 191]
      ]);

    case "rainbow":
      // Rainbow colormap
      return createGradient([
        [148, 0, 211],   // Violet
        [0, 0, 255],     // Blue
        [0, 255, 255],   // Cyan
        [0, 255, 0],     // Green
        [255, 255, 0],   // Yellow
        [255, 127, 0],   // Orange
        [255, 0, 0]      // Red
      ]);

    case "grayscale":
    default:
      // Grayscale colormap
      for (let i = 0; i < 256; i++) {
        const gray = Math.round((i / 255) * 255);
        colors.push([gray, gray, gray, 255]);
      }
      return colors;
  }
};

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
  const spectrogramPluginRef = useRef<SpectrogramPlugin | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const [spectrogramZoom, setSpectrogramZoom] = useState(1);
  const [waveformZoom, setWaveformZoom] = useState(1);
  const [waveformHeight, setWaveformHeight] = useState(120);
  const [spectrogramSettings, setSpectrogramSettings] = useState<SpectrogramSettings>({
    colorMap: "spectral",
    fftSamples: 1024,
    frequencyMin: 0,
    frequencyMax: 8000,
    windowFunction: "hann",
    overlap: 0.5,
  });

  useEffect(() => {
    if (!waveformRef.current || !spectrogramRef.current) return;

    let isMounted = true;
    let ws: WaveSurfer | null = null;
    
    const initializeWaveSurfer = async () => {
      try {
        // Cleanup previous instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }

        if (!isMounted) return;

        // Initialize WaveSurfer with unipolar waveform (0 to N, not bipolar)
        ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "hsl(var(--muted-foreground))",
          progressColor: "hsl(var(--primary))",
          cursorColor: "hsl(var(--primary))",
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 2,
          height: waveformHeight,
          barGap: 1,
          normalize: true,
          backend: 'WebAudio',
          minPxPerSec: 50 * waveformZoom,
          hideScrollbar: false,
        });

        if (!isMounted) {
          ws.destroy();
          return;
        }

        // Initialize Spectrogram Plugin
        const colorMapArray = generateColorMap(spectrogramSettings.colorMap);
        
        const spectrogramPlugin = SpectrogramPlugin.create({
          container: spectrogramRef.current!,
          labels: true,
          height: 350,
          splitChannels: false,
          colorMap: colorMapArray,
          windowFunc: 'hann',
          alpha: 1,
        });

        ws.registerPlugin(spectrogramPlugin);

        // Event listeners
        ws.on("ready", () => {
          if (isMounted) {
            setDuration(ws!.getDuration());
          }
        });

        ws.on("timeupdate", (time) => {
          if (isMounted) {
            setCurrentTime(time);
          }
        });

        ws.on("finish", () => {
          if (isMounted) {
            setIsPlaying(false);
          }
        });

        ws.on("play", () => {
          if (isMounted) {
            setIsPlaying(true);
          }
        });

        ws.on("pause", () => {
          if (isMounted) {
            setIsPlaying(false);
          }
        });

        ws.on("error", (error) => {
          console.warn("WaveSurfer error:", error);
        });

        if (isMounted) {
          wavesurferRef.current = ws;
          spectrogramPluginRef.current = spectrogramPlugin;
          
          // Load audio with error handling
          try {
            await ws.load(audioUrl);
          } catch (error) {
            console.warn("Audio loading error:", error);
            if (error instanceof Error && error.name === 'AbortError') {
              // Ignore AbortError as it's usually due to component unmounting
              return;
            }
            toast.error("Failed to load audio file");
          }
        }

      } catch (error) {
        console.error("WaveSurfer initialization error:", error);
        if (isMounted && error instanceof Error && error.name !== 'AbortError') {
          toast.error("Failed to initialize audio player");
        }
      }
    };

    initializeWaveSurfer();

    return () => {
      isMounted = false;
      if (ws) {
        try {
          ws.destroy();
        } catch (error) {
          console.warn("Error destroying WaveSurfer:", error);
        }
      }
    };
  }, [audioUrl, spectrogramSettings.colorMap]);

  useEffect(() => {
    // Reinitialize when settings change (except initial load)
    if (wavesurferRef.current && spectrogramRef.current && waveformRef.current) {
      let isMounted = true;
      
      const reinitialize = async () => {
        try {
          wavesurferRef.current?.destroy();
          
          if (!isMounted) return;
          
          const ws = WaveSurfer.create({
            container: waveformRef.current!,
            waveColor: "hsl(var(--muted-foreground))",
            progressColor: "hsl(var(--primary))",
            cursorColor: "hsl(var(--primary))",
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 2,
            height: waveformHeight,
            barGap: 1,
            normalize: true,
            backend: 'WebAudio',
            minPxPerSec: 50 * waveformZoom,
            hideScrollbar: false,
          });

          const colorMapArray = generateColorMap(spectrogramSettings.colorMap);

          const spectrogramPlugin = SpectrogramPlugin.create({
            container: spectrogramRef.current!,
            labels: true,
            height: Math.max(250, 350 * spectrogramZoom),
            splitChannels: false,
            colorMap: colorMapArray,
            windowFunc: spectrogramSettings.windowFunction,
            alpha: 1,
            noverlap: Math.floor(spectrogramSettings.fftSamples * spectrogramSettings.overlap),
          });

          ws.registerPlugin(spectrogramPlugin);

          ws.on("ready", () => {
            if (isMounted) setDuration(ws.getDuration());
          });

          ws.on("timeupdate", (time) => {
            if (isMounted) setCurrentTime(time);
          });

          ws.on("finish", () => {
            if (isMounted) setIsPlaying(false);
          });

          ws.on("play", () => {
            if (isMounted) setIsPlaying(true);
          });

          ws.on("pause", () => {
            if (isMounted) setIsPlaying(false);
          });

          ws.on("error", (error) => {
            console.warn("WaveSurfer reinit error:", error);
          });

          if (isMounted) {
            wavesurferRef.current = ws;
            spectrogramPluginRef.current = spectrogramPlugin;
            
            try {
              await ws.load(audioUrl);
            } catch (error) {
              if (error instanceof Error && error.name !== 'AbortError') {
                console.warn("Audio reload error:", error);
              }
            }
          }
        } catch (error) {
          console.error("Reinitialize error:", error);
        }
      };

      reinitialize();

      return () => {
        isMounted = false;
      };
    }
  }, [spectrogramSettings, spectrogramZoom, waveformZoom, waveformHeight, audioUrl]);

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

      {/* Professional Audio Controls */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
        {/* Transport Controls */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button 
              size="sm" 
              variant={isPlaying ? "secondary" : "default"}
              onClick={skipBackward} 
              title="Skip backward 5 seconds (←)"
              className="h-8 w-8 p-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={isPlaying ? "destructive" : "default"}
              onClick={togglePlayPause} 
              title="Play/Pause (Space)"
              className="h-8 w-10 p-0 font-semibold"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant={isPlaying ? "secondary" : "default"}
              onClick={skipForward} 
              title="Skip forward 5 seconds (→)"
              className="h-8 w-8 p-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded-md">
            <span className="text-primary font-semibold">{formatTime(currentTime)}</span> / {formatTime(duration)}
          </div>
          
          {/* Vertical Zoom Controls */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <span className="text-xs text-muted-foreground px-2">Zoom</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSpectrogramZoom(Math.max(0.5, spectrogramZoom - 0.25))}
              title="Zoom out vertically"
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center font-mono">
              {(spectrogramZoom * 100).toFixed(0)}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSpectrogramZoom(Math.min(4, spectrogramZoom + 0.25))}
              title="Zoom in vertically"
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          {/* Advanced Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" title="Advanced spectrogram settings" className="h-8">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Spectrogram Analysis</h4>
                </div>
                
                <div className="space-y-2">
                  <UILabel>Color Scheme</UILabel>
                  <Select
                    value={spectrogramSettings.colorMap}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, colorMap: value as SpectrogramSettings["colorMap"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spectral">🌈 Spectral (Default)</SelectItem>
                      <SelectItem value="hot">🔥 Hot (Black→Red→Yellow→White)</SelectItem>
                      <SelectItem value="cool">❄️ Cool (Cyan→Magenta)</SelectItem>
                      <SelectItem value="viridis">🟣 Viridis (Perceptual)</SelectItem>
                      <SelectItem value="plasma">🌌 Plasma (Purple→Pink→Yellow)</SelectItem>
                      <SelectItem value="magma">🌋 Magma (Black→Purple→Yellow)</SelectItem>
                      <SelectItem value="rainbow">🌈 Rainbow</SelectItem>
                      <SelectItem value="grayscale">⚫ Grayscale</SelectItem>
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
                  <UILabel>FFT Size (frequency resolution)</UILabel>
                  <Select
                    value={spectrogramSettings.fftSamples.toString()}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, fftSamples: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="256">256 (Fast, low resolution)</SelectItem>
                      <SelectItem value="512">512 (Balanced)</SelectItem>
                      <SelectItem value="1024">1024 (High resolution) ⭐</SelectItem>
                      <SelectItem value="2048">2048 (Very high)</SelectItem>
                      <SelectItem value="4096">4096 (Maximum detail)</SelectItem>
                      <SelectItem value="8192">8192 (Ultra detail)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <UILabel>Window Function (spectral leakage control)</UILabel>
                  <Select
                    value={spectrogramSettings.windowFunction}
                    onValueChange={(value) => setSpectrogramSettings({ ...spectrogramSettings, windowFunction: value as SpectrogramSettings["windowFunction"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hann">🔔 Hann (Default, good general purpose)</SelectItem>
                      <SelectItem value="hamming">🔨 Hamming (Sharp cutoff)</SelectItem>
                      <SelectItem value="blackman">⚫ Blackman (Low sidelobes)</SelectItem>
                      <SelectItem value="bartlett">📐 Bartlett (Triangular)</SelectItem>
                      <SelectItem value="rectangular">⬜ Rectangular (No windowing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <UILabel>Overlap: {Math.round(spectrogramSettings.overlap * 100)}% (time resolution)</UILabel>
                  <Slider
                    value={[spectrogramSettings.overlap]}
                    onValueChange={([value]) => setSpectrogramSettings({ ...spectrogramSettings, overlap: value })}
                    min={0}
                    max={0.9}
                    step={0.1}
                    className="cursor-pointer"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher overlap = smoother time resolution, more computation
                  </div>
                </div>

                {/* Waveform Controls */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Waveform Controls</h4>
                  
                  <div className="space-y-2 mb-3">
                    <UILabel>Waveform Zoom: {waveformZoom.toFixed(1)}x</UILabel>
                    <Slider
                      value={[waveformZoom]}
                      onValueChange={([value]) => setWaveformZoom(value)}
                      min={1}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                    <div className="text-xs text-muted-foreground">
                      Zoom into specific parts of the waveform
                    </div>
                  </div>

                  <div className="space-y-2">
                    <UILabel>Waveform Height: {waveformHeight}px</UILabel>
                    <Slider
                      value={[waveformHeight]}
                      onValueChange={([value]) => setWaveformHeight(value)}
                      min={64}
                      max={512}
                      step={32}
                      className="cursor-pointer"
                    />
                    <div className="text-xs text-muted-foreground">
                      Adjust detail level (peaks visibility)
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Selection */}
          <Button
            size="sm"
            variant={selectionStart !== null && selectionEnd !== null ? "default" : "outline"}
            onClick={exportSpectrogramSelection}
            disabled={selectionStart === null || selectionEnd === null}
            title="Export selected region as high-quality JPG"
            className="h-8"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        {/* Audio Segments */}
        {segments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-muted/20 rounded-lg">
            <span className="text-xs text-muted-foreground font-medium">Segments:</span>
            {segments.map((segment) => {
              const label = labels.find(l => l.id === segment.labelId);
              if (!label) return null;
              return (
                <Badge
                  key={segment.id}
                  style={{ 
                    backgroundColor: label.color + "25", 
                    color: label.color,
                    borderColor: label.color + "50"
                  }}
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 border hover:scale-105"
                  onClick={() => {
                    const ws = wavesurferRef.current;
                    if (ws) {
                      ws.seekTo(segment.startTime / duration);
                    }
                  }}
                >
                  <span className="font-medium">{label.name}</span>
                  <span className="ml-1 text-xs opacity-80">
                    {formatTime(segment.startTime)}-{formatTime(segment.endTime)}
                  </span>
                  <button
                    className="ml-1 hover:text-destructive transition-colors"
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
        )}
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

      {/* Professional Audio Analysis View */}
      <div className="flex-1 p-6 overflow-auto space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
        
        {/* Waveform Panel */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border-2 border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-foreground">Audio Waveform</h3>
              <Badge variant="secondary" className="text-xs">Time Domain</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Click twice to create segments
            </div>
          </div>
          <div className="p-4">
            <div
              ref={waveformRef}
              className="w-full rounded-lg cursor-pointer bg-muted/10 border-2 border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              onClick={handleRegionClick}
            />
          </div>
        </div>

        {/* Spectrogram Panel */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border-2 border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-foreground">Frequency Spectrogram</h3>
              <Badge variant="secondary" className="text-xs">FFT Analysis</Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {spectrogramSettings.colorMap}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>FFT: {spectrogramSettings.fftSamples}</span>
              <span>Window: {spectrogramSettings.windowFunction}</span>
              <span>Overlap: {Math.round(spectrogramSettings.overlap * 100)}%</span>
            </div>
          </div>
          <div className="p-4">
            <div
              ref={spectrogramRef}
              className="w-full rounded-lg bg-muted/10 border-2 border-border/40 overflow-hidden"
              style={{ height: `${Math.max(250, 350 * spectrogramZoom)}px` }}
            />
          </div>
        </div>
      </div>

      {/* Professional Status Bar */}
      <div className="px-6 py-3 border-t bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{segments.length}</span> segment{segments.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-muted-foreground">
              Duration: <span className="font-mono font-semibold text-foreground">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-muted-foreground">
            <span>
              Freq Range: <span className="font-mono">{spectrogramSettings.frequencyMin}-{spectrogramSettings.frequencyMax} Hz</span>
            </span>
            <span>
              Resolution: <span className="font-mono">{spectrogramSettings.fftSamples} pt FFT</span>
            </span>
            <span>
              Window: <span className="capitalize font-mono">{spectrogramSettings.windowFunction}</span>
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: spectrogramSettings.colorMap === 'spectral' ? '#0080ff' : spectrogramSettings.colorMap === 'hot' ? '#ff4500' : '#8a2be2' }}></div>
              <span className="capitalize">{spectrogramSettings.colorMap}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
