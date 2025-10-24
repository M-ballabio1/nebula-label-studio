import { TextAnnotation, Label } from "@/types/annotation";
import { Type } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextAnnotationCanvasProps {
  text: string;
  annotations: TextAnnotation[];
  labels: Label[];
  selectedLabelId: string | null;
  onAddAnnotation: (annotation: Omit<TextAnnotation, "id">) => void;
}

export const TextAnnotationCanvas = ({
  text,
  annotations,
  labels,
  selectedLabelId,
  onAddAnnotation,
}: TextAnnotationCanvasProps) => {
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
          className="relative px-1 py-0.5 rounded transition-all"
          style={{
            backgroundColor: label.color + "33",
            borderBottom: `2px solid ${label.color}`,
          }}
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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedLabelId
              ? `Select text to annotate as: ${labels.find((l) => l.id === selectedLabelId)?.name}`
              : "Select a label to start annotating"}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div
          className="p-8 text-base leading-relaxed select-text"
          onMouseUp={handleTextSelect}
        >
          {renderAnnotatedText()}
        </div>
      </ScrollArea>
    </div>
  );
};
