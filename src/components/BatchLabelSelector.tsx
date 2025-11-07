import { Label } from "@/types/annotation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Tag, X } from "lucide-react";

interface BatchLabelSelectorProps {
  selectedCount: number;
  labels: Label[];
  onAssignLabel: (labelId: string) => void;
  onClearSelection: () => void;
}

export const BatchLabelSelector = ({
  selectedCount,
  labels,
  onAssignLabel,
  onClearSelection,
}: BatchLabelSelectorProps) => {
  const [selectedLabelId, setSelectedLabelId] = useState<string>("");

  const handleAssign = () => {
    if (selectedLabelId) {
      onAssignLabel(selectedLabelId);
      setSelectedLabelId("");
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-card border-2 border-primary rounded-lg shadow-lg p-4 flex items-center gap-3">
      <Tag className="w-5 h-5 text-primary" />
      <span className="font-medium">
        {selectedCount} {selectedCount === 1 ? "immagine selezionata" : "immagini selezionate"}
      </span>
      <Select value={selectedLabelId} onValueChange={setSelectedLabelId}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleziona label" />
        </SelectTrigger>
        <SelectContent>
          {labels.map((label) => (
            <SelectItem key={label.id} value={label.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={handleAssign} disabled={!selectedLabelId}>
        Assegna
      </Button>
      <Button size="sm" variant="ghost" onClick={onClearSelection}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
