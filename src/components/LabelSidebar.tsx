import { useState } from "react";
import { Plus, Tag, Trash2, Info, Ruler, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, BoundingBox } from "@/types/annotation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LabelSidebarProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (id: string) => void;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onDeleteLabel: (id: string) => void;
  imageDimensions?: { width: number; height: number };
  normalizedDimensions?: { width: number; height: number };
  boxes?: BoundingBox[];
  selectedBox?: BoundingBox | null;
  hoveredBox?: BoundingBox | null;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"
];

export const LabelSidebar = ({
  labels,
  selectedLabelId,
  onSelectLabel,
  onAddLabel,
  onDeleteLabel,
  imageDimensions,
  normalizedDimensions,
  boxes = [],
  selectedBox,
  hoveredBox,
}: LabelSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [hotkey, setHotkey] = useState("");

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      onAddLabel({
        name: newLabelName.trim(),
        color: selectedColor,
        hotkey: hotkey || undefined,
      });
      setNewLabelName("");
      setHotkey("");
      setIsOpen(false);
    }
  };

  return (
    <div className="border-r bg-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Labels
          </h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 bg-secondary hover:opacity-90 glow-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Label</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Label Name</label>
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="e.g., Person, Car, Background"
                    onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          selectedColor === color ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hotkey (Optional)</label>
                  <Input
                    value={hotkey}
                    onChange={(e) => setHotkey(e.target.value)}
                    placeholder="e.g., 1, 2, 3"
                    maxLength={1}
                  />
                </div>
                <Button onClick={handleAddLabel} className="w-full bg-gradient-hero">
                  Add Label
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-muted-foreground">
          {labels.length} label{labels.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {labels.map((label) => (
            <div
              key={label.id}
              className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                selectedLabelId === label.id ? "bg-accent ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelectLabel(label.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm font-medium">{label.name}</span>
                  {label.hotkey && (
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded border">
                      {label.hotkey}
                    </kbd>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLabel(label.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {imageDimensions && imageDimensions.width > 0 && (
        <>
          <Separator />
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Image Info
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-muted/50">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>Original Size</span>
                </div>
                <div className="font-mono font-medium">
                  {imageDimensions.width} × {imageDimensions.height} px
                </div>
              </div>

              {normalizedDimensions && (
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-muted-foreground mb-1">Display Size</div>
                  <div className="font-mono font-medium">
                    {Math.round(normalizedDimensions.width)} × {Math.round(normalizedDimensions.height)} px
                  </div>
                </div>
              )}

              <div className="p-2 rounded bg-muted/50">
                <div className="text-muted-foreground mb-1">Annotations</div>
                <div className="font-medium">
                  {boxes.length} box{boxes.length !== 1 ? "es" : ""}
                </div>
              </div>
            </div>

            {(hoveredBox || selectedBox) && (() => {
              const displayBox = hoveredBox || selectedBox;
              const label = displayBox ? labels.find((l) => l.id === displayBox.labelId) : null;
              
              return displayBox && label ? (
                <div 
                  className="p-3 rounded-lg border-2 bg-background/50" 
                  style={{ borderColor: label.color }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-3.5 h-3.5" style={{ color: label.color }} />
                    <span className="font-semibold text-xs">
                      {hoveredBox ? "Hovered" : "Selected"} Box
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Label:</span>
                      <span className="font-medium truncate ml-2" title={label.name}>
                        {label.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-mono text-[10px]">
                        ({Math.round(displayBox.x)}, {Math.round(displayBox.y)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-mono text-[10px]">
                        {Math.round(displayBox.width)} × {Math.round(displayBox.height)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Area:</span>
                      <span className="font-mono text-[10px]">
                        {Math.round(displayBox.width * displayBox.height)} px²
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </>
      )}
    </div>
  );
};
