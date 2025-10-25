import { TextAnnotation, Label } from "@/types/annotation";
import { Type, Info, MousePointerClick } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
          className="relative px-1 py-0.5 rounded transition-all hover:shadow-sm cursor-pointer"
          style={{
            backgroundColor: label.color + "30",
            borderBottom: `2px solid ${label.color}`,
          }}
          title={`${label.name} (${annotation.startIndex}-${annotation.endIndex})`}
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

  const selectedLabel = labels.find(l => l.id === selectedLabelId);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Workflow Instructions - Hover to view */}
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-4 right-4 z-10 h-9 w-9 p-0 bg-card/95 backdrop-blur-sm shadow-lg"
          >
            <Info className="w-4 h-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Type className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-sm">Text Labeling Workflow</h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Select a label from the sidebar</li>
                <li>Click and drag to select text</li>
                <li>Release to apply the label</li>
                <li>Repeat for different text spans</li>
                <li>Annotations can overlap if needed</li>
              </ol>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Tip:</p>
                <div className="text-[10px] text-muted-foreground">
                  <p>• Annotate the same text with multiple labels</p>
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Status Bar */}
      <div className="px-4 pb-3 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedLabel ? (
              <span className="flex items-center gap-2">
                Labeling as:
                <Badge style={{ backgroundColor: selectedLabel.color + "20", color: selectedLabel.color }}>
                  {selectedLabel.name}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">Select a label to start annotating</span>
            )}
          </span>
        </div>
      </div>

      {/* Text Content */}
      <ScrollArea className="flex-1">
        <div
          className={`p-8 text-base leading-relaxed ${selectedLabelId ? 'cursor-text' : 'cursor-default'}`}
          onMouseUp={handleTextSelect}
          style={{ userSelect: selectedLabelId ? 'text' : 'none' }}
        >
          {text.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No text content loaded</p>
            </div>
          ) : annotations.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p className="mb-2">No annotations yet. Select a label and start highlighting text!</p>
              </div>
              <div className="prose prose-sm max-w-none">
                {text}
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {renderAnnotatedText()}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <span>{annotations.length} annotation{annotations.length !== 1 ? "s" : ""} created</span>
        <span>{text.split(' ').length} words total</span>
      </div>
    </div>
  );
};
