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

  // Group segments by label for better organization
  const segmentsByLabel = segments.reduce((acc, segment) => {
    const label = labels.find(l => l.id === segment.labelId);
    if (!label) return acc;
    if (!acc[label.id]) {
      acc[label.id] = { label, segments: [] };
    }
    acc[label.id].segments.push(segment);
    return acc;
  }, {} as Record<string, { label: Label; segments: AudioSegment[] }>);

  if (segments.length === 0) {
    return (
      <div className="w-72 border-r bg-card flex flex-col items-center justify-center p-6 text-center">
        <Music className="w-12 h-12 text-muted-foreground mb-3 opacity-30" />
        <p className="text-sm font-medium mb-2">No segments yet</p>
        <p className="text-xs text-muted-foreground">
          Select a label and click on the waveform to create audio segments
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 border-r bg-card flex flex-col">
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Audio Segments</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {segments.length} segment{segments.length !== 1 ? "s" : ""} • {Object.keys(segmentsByLabel).length} label{Object.keys(segmentsByLabel).length !== 1 ? "s" : ""}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {Object.values(segmentsByLabel).map(({ label, segments: labelSegments }) => (
            <div key={label.id} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({labelSegments.length})
                </span>
              </div>
              {labelSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="p-3 rounded-lg border bg-background hover:bg-muted/50 hover:border-primary/50 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{label.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteSegment(segment.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                      title="Delete segment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground/70">Start:</span>
                      <span>{formatTime(segment.startTime)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground/70">End:</span>
                      <span>{formatTime(segment.endTime)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1 font-mono">
                      <span className="text-muted-foreground/70">Duration:</span>
                      <span className="font-semibold">
                        {formatTime(segment.endTime - segment.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
