export interface ShortcutConfig {
  id: string;
  name: string;
  description: string;
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  category: 'navigation' | 'annotation' | 'editing' | 'view';
}

export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  // Navigation
  {
    id: 'next-image',
    name: 'Next Image',
    description: 'Navigate to next image',
    key: 'ArrowRight',
    category: 'navigation',
  },
  {
    id: 'prev-image',
    name: 'Previous Image',
    description: 'Navigate to previous image',
    key: 'ArrowLeft',
    category: 'navigation',
  },
  {
    id: 'first-image',
    name: 'First Image',
    description: 'Jump to first image',
    key: 'Home',
    category: 'navigation',
  },
  {
    id: 'last-image',
    name: 'Last Image',
    description: 'Jump to last image',
    key: 'End',
    category: 'navigation',
  },
  
  // Annotation
  {
    id: 'submit-annotation',
    name: 'Submit Annotation',
    description: 'Complete and submit current annotation',
    key: 'Enter',
    category: 'annotation',
  },
  {
    id: 'cancel-annotation',
    name: 'Cancel Annotation',
    description: 'Cancel current annotation',
    key: 'Escape',
    category: 'annotation',
  },
  {
    id: 'select-label-1',
    name: 'Select Label 1',
    description: 'Quick select first label',
    key: '1',
    category: 'annotation',
  },
  {
    id: 'select-label-2',
    name: 'Select Label 2',
    description: 'Quick select second label',
    key: '2',
    category: 'annotation',
  },
  {
    id: 'select-label-3',
    name: 'Select Label 3',
    description: 'Quick select third label',
    key: '3',
    category: 'annotation',
  },
  {
    id: 'select-label-4',
    name: 'Select Label 4',
    description: 'Quick select fourth label',
    key: '4',
    category: 'annotation',
  },
  {
    id: 'select-label-5',
    name: 'Select Label 5',
    description: 'Quick select fifth label',
    key: '5',
    category: 'annotation',
  },
  {
    id: 'select-label-6',
    name: 'Select Label 6',
    description: 'Quick select sixth label',
    key: '6',
    category: 'annotation',
  },
  {
    id: 'select-label-7',
    name: 'Select Label 7',
    description: 'Quick select seventh label',
    key: '7',
    category: 'annotation',
  },
  {
    id: 'select-label-8',
    name: 'Select Label 8',
    description: 'Quick select eighth label',
    key: '8',
    category: 'annotation',
  },
  {
    id: 'select-label-9',
    name: 'Select Label 9',
    description: 'Quick select ninth label',
    key: '9',
    category: 'annotation',
  },
  
  // Editing
  {
    id: 'delete',
    name: 'Delete',
    description: 'Delete selected annotation',
    key: 'Delete',
    category: 'editing',
  },
  {
    id: 'undo',
    name: 'Undo',
    description: 'Undo last action',
    key: 'z',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'redo',
    name: 'Redo',
    description: 'Redo last undone action',
    key: 'y',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'save',
    name: 'Save',
    description: 'Save current annotations',
    key: 's',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'copy',
    name: 'Copy',
    description: 'Copy selected annotation',
    key: 'c',
    ctrl: true,
    category: 'editing',
  },
  {
    id: 'paste',
    name: 'Paste',
    description: 'Paste copied annotation',
    key: 'v',
    ctrl: true,
    category: 'editing',
  },
  
  // View
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Zoom in on canvas',
    key: '=',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Zoom out on canvas',
    key: '-',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'zoom-reset',
    name: 'Reset Zoom',
    description: 'Reset zoom to 100%',
    key: '0',
    ctrl: true,
    category: 'view',
  },
  {
    id: 'toggle-labels',
    name: 'Toggle Labels',
    description: 'Show/hide label names',
    key: 'l',
    ctrl: true,
    category: 'view',
  },
];

export const getShortcutString = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  
  let key = shortcut.key;
  if (key === 'ArrowRight') key = '→';
  else if (key === 'ArrowLeft') key = '←';
  else if (key === 'ArrowUp') key = '↑';
  else if (key === 'ArrowDown') key = '↓';
  else if (key === 'Delete') key = 'Del';
  else if (key === 'Escape') key = 'Esc';
  else if (key === 'Enter') key = '↵';
  
  parts.push(key.toUpperCase());
  return parts.join('+');
};
