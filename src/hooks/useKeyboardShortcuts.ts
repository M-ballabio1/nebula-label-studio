import { useEffect } from "react";
import { Label } from "@/types/annotation";

interface UseKeyboardShortcutsProps {
  labels: Label[];
  onSelectLabel: (id: string) => void;
  onPreviousImage: () => void;
  onNextImage: () => void;
  onSave?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const useKeyboardShortcuts = ({
  labels,
  onSelectLabel,
  onPreviousImage,
  onNextImage,
  onSave,
  canGoPrevious,
  canGoNext,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Arrow keys for image navigation
      if (e.key === "ArrowLeft" && canGoPrevious) {
        onPreviousImage();
        e.preventDefault();
      }
      if (e.key === "ArrowRight" && canGoNext) {
        onNextImage();
        e.preventDefault();
      }

      // Ctrl+S for save
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && onSave) {
        e.preventDefault();
        onSave();
      }

      // Number keys 1-9 for label selection
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const labelIndex = num - 1;
        if (labelIndex < labels.length) {
          onSelectLabel(labels[labelIndex].id);
        }
      }

      // Letter hotkeys for labels
      const label = labels.find((l) => l.hotkey === e.key);
      if (label) {
        onSelectLabel(label.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [labels, onSelectLabel, onPreviousImage, onNextImage, onSave, canGoPrevious, canGoNext]);
};
