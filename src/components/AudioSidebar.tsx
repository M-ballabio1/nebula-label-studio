import { LabelSidebar } from "./LabelSidebar";
import { AudioSegmentsList } from "./AudioSegmentsList";
import { AudioSegment, Label } from "@/types/annotation";

interface AudioSidebarProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (id: string) => void;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onDeleteLabel: (id: string) => void;
  segments: AudioSegment[];
  onDeleteSegment: (id: string) => void;
}

export const AudioSidebar = ({
  labels,
  selectedLabelId,
  onSelectLabel,
  onAddLabel,
  onDeleteLabel,
  segments,
  onDeleteSegment,
}: AudioSidebarProps) => {
  return (
    <div className="flex">
      <div className="w-64">
        <LabelSidebar
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={onSelectLabel}
          onAddLabel={onAddLabel}
          onDeleteLabel={onDeleteLabel}
        />
      </div>
      <AudioSegmentsList
        segments={segments}
        labels={labels}
        onDeleteSegment={onDeleteSegment}
      />
    </div>
  );
};
