import { Label, ClassificationTag } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

interface ClassificationPanelProps {
  imageUrl: string;
  tags: ClassificationTag[];
  labels: Label[];
  onToggleTag: (labelId: string) => void;
  imageDimensions?: { original: { width: number; height: number }; normalized: { width: number; height: number } };
}

export const ClassificationPanel = ({
  imageUrl,
  tags,
  labels,
  onToggleTag,
}: ClassificationPanelProps) => {
  const isTagged = (labelId: string) => tags.some((t) => t.labelId === labelId);

  return (
    <div className="flex-1 flex bg-muted/30 items-center justify-center p-8">
      <img
        src={imageUrl}
        alt="Classification"
        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
      />
    </div>
  );
};
