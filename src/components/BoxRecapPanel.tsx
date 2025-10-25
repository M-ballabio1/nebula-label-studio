import { BoundingBox, Label } from "@/types/annotation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BoxRecapPanelProps {
  boxes: BoundingBox[];
  labels: Label[];
  selectedBoxId: string | null;
  onSelectBox: (id: string) => void;
  onDeleteBox: (id: string) => void;
}

export const BoxRecapPanel = ({
  boxes,
  labels,
  selectedBoxId,
  onSelectBox,
  onDeleteBox,
}: BoxRecapPanelProps) => {
  if (boxes.length === 0) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-3">Bounding Boxes</h3>
        <p className="text-xs text-muted-foreground">No boxes yet. Draw boxes on the image to see them here.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm mb-3">
        Bounding Boxes ({boxes.length})
      </h3>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {boxes.map((box) => {
            const label = labels.find((l) => l.id === box.labelId);
            const isSelected = selectedBoxId === box.id;
            
            return (
              <div
                key={box.id}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected ? "bg-accent border-primary ring-2 ring-primary" : "hover:bg-accent/50"
                }`}
                onClick={() => onSelectBox(box.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {label && (
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                    )}
                    <span className="text-xs font-medium">
                      {label?.name || "Unknown"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBox(box.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                  <div className="flex justify-between">
                    <span>X:</span>
                    <span>{box.x.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Y:</span>
                    <span>{box.y.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>W:</span>
                    <span>{box.width.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>H:</span>
                    <span>{box.height.toFixed(3)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span>{(box.width * box.height).toFixed(5)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
