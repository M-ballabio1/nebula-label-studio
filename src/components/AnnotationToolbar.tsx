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
import { toast } from "sonner";
import { CanvasTool } from "@/contexts/AnnotationContext";

interface AnnotationToolbarProps {
  activeTool?: CanvasTool;
  onToolChange?: (tool: CanvasTool) => void;
  imageTransform?: { rotation: number; flipH: boolean; flipV: boolean };
  onTransformChange?: (transform: { rotation: number; flipH: boolean; flipV: boolean }) => void;
  imageFilters?: { brightness: number; contrast: number; saturation: number };
  onFiltersChange?: (filters: { brightness: number; contrast: number; saturation: number }) => void;
  showAnnotations?: boolean;
  onShowAnnotationsChange?: (show: boolean) => void;
  lockAnnotations?: boolean;
  onLockAnnotationsChange?: (lock: boolean) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const AnnotationToolbar = ({
  activeTool = "draw",
  onToolChange,
  imageTransform = { rotation: 0, flipH: false, flipV: false },
  onTransformChange,
  imageFilters = { brightness: 100, contrast: 100, saturation: 100 },
  onFiltersChange,
  showAnnotations = true,
  onShowAnnotationsChange,
  lockAnnotations = false,
  onLockAnnotationsChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
}: AnnotationToolbarProps) => {
  const tools = [
    { id: "select" as CanvasTool, icon: MousePointer2, label: "Select Tool (V)", hotkey: "V" },
    { id: "pan" as CanvasTool, icon: Hand, label: "Pan Tool (H)", hotkey: "H" },
    { id: "draw" as CanvasTool, icon: Pencil, label: "Draw (D)", hotkey: "D" },
    { id: "erase" as CanvasTool, icon: Eraser, label: "Erase (E)", hotkey: "E" },
    { id: "measure" as CanvasTool, icon: Ruler, label: "Measure (M)", hotkey: "M" },
  ];

  const handleRotate = () => {
    const newRotation = (imageTransform.rotation + 90) % 360;
    onTransformChange?.({ ...imageTransform, rotation: newRotation });
    toast.success(`Rotated to ${newRotation}°`);
  };

  const handleFlipH = () => {
    onTransformChange?.({ ...imageTransform, flipH: !imageTransform.flipH });
    toast.success(imageTransform.flipH ? "Flip horizontal reset" : "Flipped horizontally");
  };

  const handleFlipV = () => {
    onTransformChange?.({ ...imageTransform, flipV: !imageTransform.flipV });
    toast.success(imageTransform.flipV ? "Flip vertical reset" : "Flipped vertically");
  };

  const handleResetFilters = () => {
    onFiltersChange?.({ brightness: 100, contrast: 100, saturation: 100 });
    toast.success("Filters reset");
  };

  const handleCopy = () => {
    // Copy is handled by canvas keyboard shortcuts
    toast.info("Copy annotations (Ctrl+C)");
  };

  const handleCut = () => {
    // Cut will copy and delete selected
    toast.info("Cut annotations (Ctrl+X)");
  };

  return (
    <div className="h-12 border-b bg-card/95 backdrop-blur-sm flex items-center px-3 gap-2 overflow-x-auto">
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
                <span className="text-xs text-muted-foreground">{imageFilters.brightness}%</span>
              </div>
              <Slider
                value={[imageFilters.brightness]}
                onValueChange={(v) => onFiltersChange?.({ ...imageFilters, brightness: v[0] })}
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
                <span className="text-xs text-muted-foreground">{imageFilters.contrast}%</span>
              </div>
              <Slider
                value={[imageFilters.contrast]}
                onValueChange={(v) => onFiltersChange?.({ ...imageFilters, contrast: v[0] })}
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
                <span className="text-xs text-muted-foreground">{imageFilters.saturation}%</span>
              </div>
              <Slider
                value={[imageFilters.saturation]}
                onValueChange={(v) => onFiltersChange?.({ ...imageFilters, saturation: v[0] })}
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
            onShowAnnotationsChange?.(!showAnnotations);
            toast.info(showAnnotations ? "Annotations hidden" : "Annotations visible");
          }}
          className="h-8 w-8 p-0"
          title={showAnnotations ? "Hide Annotations" : "Show Annotations"}
        >
          {showAnnotations ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onLockAnnotationsChange?.(!lockAnnotations);
            toast.info(lockAnnotations ? "Annotations unlocked" : "Annotations locked");
          }}
          className="h-8 w-8 p-0"
          title={lockAnnotations ? "Unlock Annotations" : "Lock Annotations"}
        >
          {lockAnnotations ? (
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
  );
};
