import { ClassificationTag, Label } from "@/types/annotation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagRecapPanelProps {
  tags: ClassificationTag[];
  labels: Label[];
  onRemoveTag: (labelId: string) => void;
}

export const TagRecapPanel = ({
  tags,
  labels,
  onRemoveTag,
}: TagRecapPanelProps) => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
        <span>Applied Tags ({tags.length})</span>
      </h3>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No tags applied yet
            </p>
          ) : (
            tags.map((tag) => {
              const label = labels.find((l) => l.id === tag.labelId);
              if (!label) return null;

              return (
                <Card key={tag.labelId} className="p-2 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-medium truncate">
                        {label.name}
                      </span>
                      {tag.confidence !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(tag.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveTag(tag.labelId)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3" />
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