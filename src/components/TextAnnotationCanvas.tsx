import { useState } from "react";
import { TextAnnotation, Label } from "@/types/annotation";
import { Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextAnnotationCanvasProps {
  text: string;
  annotations: TextAnnotation[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddAnnotation: (annotation: Omit<TextAnnotation, "id">) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const TextAnnotationCanvas = ({
  text,
  annotations,
  labels,
  selectedLabelId,
  onAddAnnotation,
  onDeleteAnnotation,
}: TextAnnotationCanvasProps) => {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  const handleTextSelect = () => {
    const selectedText = window.getSelection();
    if (!selectedText || selectedText.rangeCount === 0 || !selectedLabelId) return;

    const range = selectedText.getRangeAt(0);
    const fullText = range.commonAncestorContainer.textContent || "";
    const startIndex = range.startOffset;
    const endIndex = range.endOffset;

    if (startIndex === endIndex) return;

    const selectedStr = fullText.substring(startIndex, endIndex);
    
    onAddAnnotation({
      startIndex,
      endIndex,
      labelId: selectedLabelId,
      text: selectedStr,
    });

    selectedText.removeAllRanges();
  };

  const getAnnotationForIndex = (index: number) => {
    return annotations.find(
      (ann) => index >= ann.startIndex && index < ann.endIndex
    );
  };

  const renderAnnotatedText = () => {
    const spans: JSX.Element[] = [];
    let currentIndex = 0;

    // Sort annotations by start index
    const sortedAnnotations = [...annotations].sort((a, b) => a.startIndex - b.startIndex);

    sortedAnnotations.forEach((annotation) => {
      const label = labels.find((l) => l.id === annotation.labelId);
      if (!label) return;

      // Add text before annotation
      if (currentIndex < annotation.startIndex) {
        spans.push(
          <span key={`text-${currentIndex}`}>
            {text.substring(currentIndex, annotation.startIndex)}
          </span>
        );
      }

      // Add annotated text
      spans.push(
        <span
          key={annotation.id}
          className={`relative px-1 py-0.5 rounded cursor-pointer transition-all ${
            hoveredAnnotationId === annotation.id ? "ring-2 ring-offset-1" : ""
          }`}
          style={{
            backgroundColor: label.color + "33",
            borderBottom: `2px solid ${label.color}`,
            color: hoveredAnnotationId === annotation.id ? label.color : "inherit",
          }}
          onMouseEnter={() => setHoveredAnnotationId(annotation.id)}
          onMouseLeave={() => setHoveredAnnotationId(null)}
          title={label.name}
        >
          {annotation.text}
        </span>
      );

      currentIndex = annotation.endIndex;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      spans.push(
        <span key={`text-${currentIndex}`}>{text.substring(currentIndex)}</span>
      );
    }

    return spans;
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedLabelId
              ? `Select text to annotate as: ${labels.find((l) => l.id === selectedLabelId)?.name}`
              : "Select a label to start annotating"}
          </span>
        </div>
        {hoveredAnnotationId && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteAnnotation(hoveredAnnotationId)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div
          className="p-8 text-base leading-relaxed select-text"
          onMouseUp={handleTextSelect}
        >
          {renderAnnotatedText()}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="text-sm text-muted-foreground">
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};
