import { SegmentationPolygon, Label } from "@/types/annotation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolygonRecapPanelProps {
  polygons: SegmentationPolygon[];
  labels: Label[];
  imageDimensions?: { original: { width: number; height: number }; normalized: { width: number; height: number } };
  onDeletePolygon: (id: string) => void;
}

export const PolygonRecapPanel = ({
  polygons,
  labels,
  imageDimensions,
  onDeletePolygon,
}: PolygonRecapPanelProps) => {
  const normalizePoints = (points: { x: number; y: number }[]) => {
    if (!imageDimensions) return points;
    const { original, normalized } = imageDimensions;
    return points.map(point => ({
      x: (point.x / normalized.width) * original.width,
      y: (point.y / normalized.height) * original.height,
    }));
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
        <span>Polygons ({polygons.length})</span>
      </h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {polygons.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No polygons yet
            </p>
          ) : (
            polygons.map((polygon) => {
              const label = labels.find((l) => l.id === polygon.labelId);
              if (!label) return null;

              const normalizedPoints = normalizePoints(polygon.points);
              const avgX = normalizedPoints.reduce((sum, p) => sum + p.x, 0) / normalizedPoints.length;
              const avgY = normalizedPoints.reduce((sum, p) => sum + p.y, 0) / normalizedPoints.length;

              return (
                <Card key={polygon.id} className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {label.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div>Points: {polygon.points.length}</div>
                        <div>Center: ({avgX.toFixed(3)}, {avgY.toFixed(3)})</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeletePolygon(polygon.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};