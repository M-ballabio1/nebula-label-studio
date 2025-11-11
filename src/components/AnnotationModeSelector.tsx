import { Square, Tag, Scissors, Mic, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnotationMode, ImageItem, Label } from "@/types/annotation";
import { AppMenu } from "./AppMenu";
import { useState } from "react";

interface AnnotationModeSelectorProps {
  mode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  images: ImageItem[];
  labels: Label[];
}

const TOOLS = [
  { mode: "detection" as AnnotationMode, icon: Square, label: "Detection" },
  { mode: "classification" as AnnotationMode, icon: Tag, label: "Classification" },
  { mode: "segmentation" as AnnotationMode, icon: Scissors, label: "Segmentation" },
  { mode: "audio" as AnnotationMode, icon: Mic, label: "Audio" },
  { mode: "text" as AnnotationMode, icon: FileText, label: "Text" },
  { mode: "video" as AnnotationMode, icon: Video, label: "Video" },
];

export const AnnotationModeSelector = ({ mode, onModeChange, images, labels }: AnnotationModeSelectorProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        {/* Colonna 1: Tools di selezione modalità */}
        <div className="flex items-center gap-2">
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
        
        {/* Colonna 2: Menu App */}
        <div className="flex items-center">
          <AppMenu
            mode={mode}
            images={images}
            labels={labels}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>
      </div>
    </div>
  );
};
