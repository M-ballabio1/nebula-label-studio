import { Square, Tag, Scissors, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnotationMode } from "@/types/annotation";

interface AnnotationToolbarProps {
  mode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
}

const TOOLS = [
  { mode: "detection" as AnnotationMode, icon: Square, label: "Detection" },
  { mode: "classification" as AnnotationMode, icon: Tag, label: "Classification" },
  { mode: "segmentation" as AnnotationMode, icon: Scissors, label: "Segmentation" },
  { mode: "audio" as AnnotationMode, icon: Mic, label: "Audio" },
  { mode: "text" as AnnotationMode, icon: FileText, label: "Text" },
];

export const AnnotationToolbar = ({ mode, onModeChange }: AnnotationToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-4 border-b bg-card">
      <span className="text-sm font-medium text-muted-foreground mr-2">Mode:</span>
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = mode === tool.mode;
        return (
          <Button
            key={tool.mode}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(tool.mode)}
            className={
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary border-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
            }
          >
            <Icon className="w-4 h-4 mr-2" />
            {tool.label}
          </Button>
        );
      })}
    </div>
  );
};
