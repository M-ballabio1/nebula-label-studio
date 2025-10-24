import { TextAnnotation, Label } from "@/types/annotation";
import { Trash2, Text } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextAnnotationsListProps {
  annotations: TextAnnotation[];
  labels: Label[];
  onDeleteAnnotation: (id: string) => void;
}

export const TextAnnotationsList = ({
  annotations,
  labels,
  onDeleteAnnotation,
}: TextAnnotationsListProps) => {
  return (
    <div className="w-80 border-l bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Text className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Annotations</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {annotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No annotations yet
            </div>
          ) : (
            annotations.map((annotation) => {
              const label = labels.find((l) => l.id === annotation.labelId);
              if (!label) return null;

              return (
                <div
                  key={annotation.id}
                  className="p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: label.color + "20",
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onDeleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    "{annotation.text}"
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Position: {annotation.startIndex}-{annotation.endIndex}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
