import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Label } from "@/types/annotation";
import { DEFAULT_SHORTCUTS, ShortcutConfig } from "@/config/shortcuts";

interface ShortcutHandlers {
  onNextImage?: () => void;
  onPreviousImage?: () => void;
  onFirstImage?: () => void;
  onLastImage?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onToggleLabels?: () => void;
  onSubmitAnnotation?: () => void;
  onCancelAnnotation?: () => void;
}

export const useKeyboardShortcuts = (
  labels: Label[],
  setSelectedLabelId: (id: string) => void,
  handlers: ShortcutHandlers = {},
  shortcuts: ShortcutConfig[] = DEFAULT_SHORTCUTS
) => {
  const matchesShortcut = useCallback((e: KeyboardEvent, shortcut: ShortcutConfig): boolean => {
    if (shortcut.ctrl && !e.ctrlKey) return false;
    if (shortcut.alt && !e.altKey) return false;
    if (shortcut.shift && !e.shiftKey) return false;
    
    const key = e.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();
    
    return key === shortcutKey;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Check for label selection (1-9)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          const label = labels[num - 1];
          if (label) {
            setSelectedLabelId(label.id);
            toast.success(`Selected label: ${label.name}`);
            return;
          }
        }
      }

      // Check all shortcuts
      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          
          switch (shortcut.id) {
            case 'next-image':
              handlers.onNextImage?.();
              break;
            case 'prev-image':
              handlers.onPreviousImage?.();
              break;
            case 'first-image':
              handlers.onFirstImage?.();
              break;
            case 'last-image':
              handlers.onLastImage?.();
              break;
            case 'save':
              handlers.onSave?.();
              break;
            case 'undo':
              handlers.onUndo?.();
              break;
            case 'redo':
              handlers.onRedo?.();
              break;
            case 'delete':
              handlers.onDelete?.();
              break;
            case 'copy':
              handlers.onCopy?.();
              break;
            case 'paste':
              handlers.onPaste?.();
              break;
            case 'zoom-in':
              handlers.onZoomIn?.();
              break;
            case 'zoom-out':
              handlers.onZoomOut?.();
              break;
            case 'zoom-reset':
              handlers.onZoomReset?.();
              break;
            case 'toggle-labels':
              handlers.onToggleLabels?.();
              break;
            case 'submit-annotation':
              handlers.onSubmitAnnotation?.();
              break;
            case 'cancel-annotation':
              handlers.onCancelAnnotation?.();
              break;
          }
          
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [labels, setSelectedLabelId, handlers, shortcuts, matchesShortcut]);
};
