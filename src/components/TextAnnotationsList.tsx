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
  // Group annotations by label for better organization
  const annotationsByLabel = annotations.reduce((acc, annotation) => {
    const label = labels.find(l => l.id === annotation.labelId);
    if (!label) return acc;
    if (!acc[label.id]) {
      acc[label.id] = { label, annotations: [] };
    }
    acc[label.id].annotations.push(annotation);
    return acc;
  }, {} as Record<string, { label: Label; annotations: TextAnnotation[] }>);

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <Text className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Text Annotations</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""} • {Object.keys(annotationsByLabel).length} label{Object.keys(annotationsByLabel).length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {annotations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Text className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-2">No annotations yet</p>
              <p className="text-xs">Select a label and highlight text to start annotating</p>
            </div>
          ) : (
            Object.values(annotationsByLabel).map(({ label, annotations: labelAnnotations }) => (
              <div key={label.id} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({labelAnnotations.length})
                  </span>
                </div>
                {labelAnnotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="p-3 bg-background rounded-lg border hover:border-primary/50 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                        style={{
                          backgroundColor: label.color + "20",
                          color: label.color,
                        }}
                      >
                        {annotation.startIndex}-{annotation.endIndex}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteAnnotation(annotation.id)}
                        title="Delete annotation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed">
                      "{annotation.text}"
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
