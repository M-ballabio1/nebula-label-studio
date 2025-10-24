import { Label, ClassificationTag } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

interface ClassificationPanelProps {
  imageUrl: string;
  tags: ClassificationTag[];
  labels: Label[];
  onToggleTag: (labelId: string) => void;
}

export const ClassificationPanel = ({
  imageUrl,
  tags,
  labels,
  onToggleTag,
}: ClassificationPanelProps) => {
  const isTagged = (labelId: string) => tags.some((t) => t.labelId === labelId);

  return (
    <div className="flex-1 flex bg-muted/30">
      <div className="flex-1 flex items-center justify-center p-8">
        <img
          src={imageUrl}
          alt="Classification"
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
      </div>
      <div className="w-80 border-l bg-card p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Apply Tags</h3>
        <div className="space-y-2">
          {labels.map((label) => {
            const tagged = isTagged(label.id);
            return (
              <Button
                key={label.id}
                variant={tagged ? "default" : "outline"}
                className={`w-full justify-start ${tagged ? "bg-gradient-hero glow-primary" : ""}`}
                onClick={() => onToggleTag(label.id)}
              >
                {tagged ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Circle className="w-4 h-4 mr-2" />
                )}
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
