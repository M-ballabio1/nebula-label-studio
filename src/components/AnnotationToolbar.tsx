import { useState, useEffect } from "react";
import {
  MousePointer2,
  Hand,
  Pencil,
  Eraser,
  Ruler,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplet,
  Undo2,
  Redo2,
  Save,
  Download,
  Settings2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type Tool = "select" | "pan" | "draw" | "erase" | "measure";

interface AnnotationToolbarProps {
  activeTool?: Tool;
  onToolChange?: (tool: Tool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Image navigation
  currentImageName?: string;
  currentImagePath?: string;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  // Visual controls
  annotationsVisible?: boolean;
  annotationsLocked?: boolean;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  onBrightnessChange?: (value: number) => void;
  onContrastChange?: (value: number) => void;
  onSaturationChange?: (value: number) => void;
  onRotate?: () => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onResetFilters?: () => void;
}

export const AnnotationToolbar = ({
  activeTool = "draw",
  onToolChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
  currentImageName,
  currentImagePath,
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext,
  annotationsVisible = true,
  annotationsLocked = false,
  onToggleVisibility,
  onToggleLock,
  brightness = 100,
  contrast = 100,
  saturation = 100,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onRotate,
  onFlipH,
  onFlipV,
  onResetFilters,
}: AnnotationToolbarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !onNext) return;
    
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

  const tools = [
    { id: "select" as Tool, icon: MousePointer2, label: "Select Tool (V)", hotkey: "V" },
    { id: "pan" as Tool, icon: Hand, label: "Pan Tool (H)", hotkey: "H" },
    { id: "draw" as Tool, icon: Pencil, label: "Draw (D)", hotkey: "D" },
    { id: "erase" as Tool, icon: Eraser, label: "Erase (E)", hotkey: "E" },
    { id: "measure" as Tool, icon: Ruler, label: "Measure (M)", hotkey: "M" },
  ];

  const handleRotate = () => {
    if (onRotate) {
      onRotate();
    } else {
      toast.info("Rotate 90° clockwise");
    }
  };

  const handleFlipH = () => {
    if (onFlipH) {
      onFlipH();
    } else {
      toast.info("Flip horizontal");
    }
  };

  const handleFlipV = () => {
    if (onFlipV) {
      onFlipV();
    } else {
      toast.info("Flip vertical");
    }
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      toast.success("Filters reset");
    }
  };

  const handleCopy = () => {
    toast.info("Copy annotations (Ctrl+C)");
  };

  const handleCut = () => {
    toast.info("Cut annotations (Ctrl+X)");
  };

  return (
    <TooltipProvider>
      <div className="h-14 border-b bg-card/95 backdrop-blur-sm flex items-center px-3 gap-2 overflow-x-auto">
        {/* Image Navigation */}
        {currentImageName && (
          <>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="h-9 w-9 p-0"
                title="Previous Image (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-9 w-9 p-0"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={onNext}
                disabled={!canGoNext}
                className="h-9 w-9 p-0"
                title="Next Image (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg ml-2">
                <span className="text-sm font-medium">{currentImageName}</span>
                {currentImagePath && (
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
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />
          </>
        )}

        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={activeTool === tool.id ? "default" : "ghost"}
              onClick={() => onToolChange?.(tool.id)}
              className="h-8 w-8 p-0"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit Tools */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCut}
            className="h-8 w-8 p-0"
            title="Cut (Ctrl+X)"
          >
            <Scissors className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Transform Tools */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRotate}
            className="h-8 w-8 p-0"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFlipH}
            className="h-8 w-8 p-0"
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFlipV}
            className="h-8 w-8 p-0"
            title="Flip Vertical"
          >
            <FlipVertical className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Image Adjustments */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 gap-1.5"
              title="Image Adjustments"
            >
              <Settings2 className="w-4 h-4" />
              <span className="text-xs">Adjust</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <Sun className="w-3 h-3" />
                    Brightness
                  </Label>
                  <span className="text-xs text-muted-foreground">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(v) => onBrightnessChange?.(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <Contrast className="w-3 h-3" />
                    Contrast
                  </Label>
                  <span className="text-xs text-muted-foreground">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={(v) => onContrastChange?.(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <Droplet className="w-3 h-3" />
                    Saturation
                  </Label>
                  <span className="text-xs text-muted-foreground">{saturation}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={(v) => onSaturationChange?.(v[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onToggleVisibility?.();
              toast.info(annotationsVisible ? "Annotations hidden" : "Annotations visible");
            }}
            className="h-8 w-8 p-0"
            title={annotationsVisible ? "Hide Annotations" : "Show Annotations"}
          >
            {annotationsVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onToggleLock?.();
              toast.info(annotationsLocked ? "Annotations unlocked" : "Annotations locked");
            }}
            className="h-8 w-8 p-0"
            title={annotationsLocked ? "Unlock Annotations" : "Lock Annotations"}
          >
            {annotationsLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className="h-8"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span className="text-xs">Save</span>
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={onExport}
            className="h-8"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
