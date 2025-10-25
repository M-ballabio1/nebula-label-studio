import { useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/types/annotation";

export const useHotkeys = (labels: Label[], setSelectedLabelId: (id: string) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const label = labels.find((l) => l.hotkey === e.key);
      if (label) {
        setSelectedLabelId(label.id);
        toast.success(`Selected label: ${label.name}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [labels, setSelectedLabelId]);
};
