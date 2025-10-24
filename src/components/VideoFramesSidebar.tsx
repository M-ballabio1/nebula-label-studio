import { VideoFrame } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film } from "lucide-react";

interface VideoFramesSidebarProps {
  frames: VideoFrame[];
  currentFrameId: string | null;
  onFrameSelect: (frameId: string) => void;
}

export const VideoFramesSidebar = ({
  frames,
  currentFrameId,
  onFrameSelect,
}: VideoFramesSidebarProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (frames.length === 0) {
    return (
      <div className="w-64 border-r bg-card flex flex-col items-center justify-center p-6 text-center">
        <Film className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No frames extracted yet. Click "Extract Frames" to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">Extracted Frames</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{frames.length} frames</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {frames.map((frame) => (
            <div
              key={frame.id}
              onClick={() => onFrameSelect(frame.id)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer hover:border-primary transition-all ${
                frame.id === currentFrameId
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              }`}
            >
              <img
                src={frame.thumbnailUrl}
                alt={`Frame ${frame.frameNumber}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-[10px] text-white font-medium">
                  Frame {frame.frameNumber}
                </p>
                <p className="text-[9px] text-white/70">
                  {formatTime(frame.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
