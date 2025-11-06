import { useState, useRef } from "react";
import { Layers, Upload, Video } from "lucide-react";
import { AppMenu } from "./AppMenu";
import { SettingsModal } from "./SettingsModal";
import { AnnotationMode, ImageItem, Label } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HeaderProps {
  mode: AnnotationMode;
  images: ImageItem[];
  labels: Label[];
  onVideoUpload?: (file: File) => void;
}

export const Header = ({ mode, images, labels, onVideoUpload }: HeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      onVideoUpload?.(file);
    }
  };

  return (
    <>
      <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center glow-primary animate-glow-pulse">
            <Layers className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent drop-shadow-sm">
              Nebula Flow
            </h1>
            <p className="text-xs font-medium">
              <span className="text-destructive">Multi-Modal</span>
              <span className="text-secondary mx-1">Annotation</span>
              <span className="text-muted-foreground">Platform</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleVideoClick}
            className="h-9"
          >
            <Video className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
          <AppMenu mode={mode} images={images} labels={labels} onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      </header>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
