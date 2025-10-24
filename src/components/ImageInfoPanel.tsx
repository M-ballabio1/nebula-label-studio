import { Info, Ruler } from "lucide-react";
import { BoundingBox, Label } from "@/types/annotation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageInfoPanelProps {
  imageDimensions: { width: number; height: number };
  normalizedDimensions: { width: number; height: number };
  selectedBox: BoundingBox | null;
  hoveredBox: BoundingBox | null;
  labels: Label[];
  totalBoxes: number;
}

export const ImageInfoPanel = ({
  imageDimensions,
  normalizedDimensions,
  selectedBox,
  hoveredBox,
  labels,
  totalBoxes,
}: ImageInfoPanelProps) => {
  const displayBox = hoveredBox || selectedBox;
  const label = displayBox ? labels.find((l) => l.id === displayBox.labelId) : null;

  return (
    <div className="w-full border-t bg-card">
      <div className="p-3">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          Image Info
        </h3>
        
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/50">
              <div className="text-muted-foreground mb-1">Original Size</div>
              <div className="font-mono">{imageDimensions.width} × {imageDimensions.height}</div>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <div className="text-muted-foreground mb-1">Display Size</div>
              <div className="font-mono">{Math.round(normalizedDimensions.width)} × {Math.round(normalizedDimensions.height)}</div>
            </div>
          </div>

          <div className="p-2 rounded bg-muted/50">
            <div className="text-muted-foreground mb-1">Annotations</div>
            <div className="font-medium">{totalBoxes} bounding box{totalBoxes !== 1 ? "es" : ""}</div>
          </div>

          {displayBox && label && (
            <div className="p-3 rounded border-2 bg-background" style={{ borderColor: label.color }}>
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4" style={{ color: label.color }} />
                <span className="font-semibold">
                  {hoveredBox ? "Hovered" : "Selected"} Box
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Label:</span>
                  <span className="font-medium">{label.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-mono">({Math.round(displayBox.x)}, {Math.round(displayBox.y)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-mono">{Math.round(displayBox.width)} × {Math.round(displayBox.height)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-mono">{Math.round(displayBox.width * displayBox.height)} px²</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
