import { AudioSegment, Label } from "@/types/annotation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Music } from "lucide-react";

interface AudioSegmentsListProps {
  segments: AudioSegment[];
  labels: Label[];
  onDeleteSegment: (id: string) => void;
}

export const AudioSegmentsList = ({
  segments,
  labels,
  onDeleteSegment,
}: AudioSegmentsListProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, "0")}`;
  };

  if (segments.length === 0) {
    return (
      <div className="w-64 border-r bg-card flex flex-col items-center justify-center p-6 text-center">
        <Music className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No segments created yet. Select a label and click on the waveform to create segments.
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">Audio Segments</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{segments.length} segments</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {segments.map((segment) => {
            const label = labels.find((l) => l.id === segment.labelId);
            if (!label) return null;
            
            return (
              <div
                key={segment.id}
                className="p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm font-medium truncate">{label.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteSegment(segment.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex justify-between">
                    <span>Start:</span>
                    <span className="font-mono">{formatTime(segment.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End:</span>
                    <span className="font-mono">{formatTime(segment.endTime)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span>Duration:</span>
                    <span className="font-mono">
                      {formatTime(segment.endTime - segment.startTime)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
