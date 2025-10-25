# Label Studio - Integration Guide

This document provides a comprehensive guide for integrating the Label Studio annotation tool into your existing applications.

## 🎯 Overview

This is a modular, plug-and-play annotation tool that supports:
- **Detection**: Bounding box annotations
- **Segmentation**: Polygon annotations  
- **Classification**: Image tagging
- **Audio**: Audio segment annotations
- **Text**: Text span annotations

## 📦 Core Components

### 1. Context Provider (`src/contexts/AnnotationContext.tsx`)
Centralized state management for the annotation tool.

```tsx
import { AnnotationProvider } from "@/contexts/AnnotationContext";
import { useAnnotationState } from "@/hooks/useAnnotationState";

function App() {
  const annotationState = useAnnotationState();
  
  return (
    <AnnotationProvider value={annotationState}>
      {/* Your components */}
    </AnnotationProvider>
  );
}
```

### 2. Keyboard Shortcuts (`src/hooks/useKeyboardShortcuts.ts`)
Fully configurable keyboard shortcuts system.

```tsx
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DEFAULT_SHORTCUTS } from "@/config/shortcuts";

// Use with custom handlers
useKeyboardShortcuts(labels, setSelectedLabelId, {
  onNextImage: handleNext,
  onPreviousImage: handlePrev,
  onSave: handleSave,
  onZoomIn: handleZoomIn,
  // ... more handlers
});
```

### 3. Annotation Utilities (`src/lib/annotationUtils.ts`)
Helper functions for common annotation operations.

```tsx
import { 
  filterImages,
  getAnnotationStats,
  getLabelColor,
  isValidBox,
  prepareExportData 
} from "@/lib/annotationUtils";

// Filter images by annotation status
const filtered = filterImages(images, {
  annotated: true,
  labelIds: ["label-1", "label-2"]
});

// Get statistics
const stats = getAnnotationStats(images);
console.log(stats); // { totalImages, annotatedImages, totalBoxes, ... }
```

## 🔧 Integration Steps

### Step 1: Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install @radix-ui/react-slider @radix-ui/react-switch
npm install sonner lucide-react lottie-react
```

### Step 2: Copy Core Files

Copy these essential files to your project:

```
src/
├── components/
│   ├── AnnotationToolbar.tsx          # Main toolbar with tools
│   ├── AnnotationModeSelector.tsx     # Mode switcher
│   ├── AnnotationContent.tsx          # Canvas renderer
│   ├── LabelSidebarUnified.tsx        # Label management
│   └── ui/                            # Shadcn components
├── hooks/
│   ├── useAnnotationState.ts          # State management
│   ├── useKeyboardShortcuts.ts        # Keyboard shortcuts
│   ├── useImageNavigation.ts          # Navigation logic
│   ├── useAnnotations.ts              # Annotation CRUD
│   └── useLabels.ts                   # Label management
├── contexts/
│   └── AnnotationContext.tsx          # Global context
├── lib/
│   └── annotationUtils.ts             # Utility functions
├── config/
│   └── shortcuts.ts                   # Shortcut configuration
└── types/
    ├── annotation.ts                  # Type definitions
    └── gridMode.ts                    # Grid view types
```

### Step 3: Configure in Your App

```tsx
import { useState } from "react";
import { AnnotationProvider } from "@/contexts/AnnotationContext";
import { useAnnotationState } from "@/hooks/useAnnotationState";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { AnnotationContent } from "@/components/AnnotationContent";

function YourApp() {
  const annotationState = useAnnotationState();
  
  return (
    <AnnotationProvider value={annotationState}>
      <div className="h-screen flex flex-col">
        <AnnotationToolbar 
          onSave={handleSave}
          onExport={handleExport}
        />
        
        <AnnotationContent
          mode={annotationState.mode}
          selectedImage={annotationState.selectedImage}
          labels={annotationState.labels}
          // ... other props
        />
      </div>
    </AnnotationProvider>
  );
}
```

## ⌨️ Keyboard Shortcuts

All shortcuts are configurable via `src/config/shortcuts.ts`:

### Navigation
- `Arrow Right` / `Arrow Left` - Next/Previous image
- `Home` / `End` - First/Last image
- `1-9` - Quick label selection

### Annotation
- `Enter` - Submit annotation
- `Escape` - Cancel annotation
- `Delete` - Remove selected annotation

### Editing
- `Ctrl+Z` / `Ctrl+Y` - Undo/Redo
- `Ctrl+S` - Save
- `Ctrl+C` / `Ctrl+V` - Copy/Paste

### View
- `Ctrl+Plus` / `Ctrl+Minus` - Zoom in/out
- `Ctrl+0` - Reset zoom
- `Ctrl+L` - Toggle labels

## 🎨 Customization

### Custom Shortcut Configuration

```tsx
// src/config/shortcuts.ts
export const CUSTOM_SHORTCUTS: ShortcutConfig[] = [
  {
    id: 'my-action',
    name: 'My Custom Action',
    description: 'Does something custom',
    key: 'm',
    ctrl: true,
    category: 'editing',
  },
  // ... more shortcuts
];

// Use in your component
useKeyboardShortcuts(labels, setSelectedLabelId, {
  // ... handlers
}, CUSTOM_SHORTCUTS);
```

### Custom Annotation Modes

```tsx
// Extend AnnotationMode type
export type CustomAnnotationMode = 
  AnnotationMode | "custom-mode";

// Add custom mode handler in AnnotationContent
case "custom-mode":
  return <CustomModeCanvas {...props} />;
```

### Custom Export Formats

```tsx
import { prepareExportData } from "@/lib/annotationUtils";

const data = prepareExportData(images, labels);

// Transform to your format
const customFormat = {
  ...data,
  customField: "custom value",
  transform: transformData(data),
};
```

## 📊 API Integration

### Connecting to Backend

```tsx
// src/services/api.ts
export const saveAnnotations = async (data: any) => {
  const response = await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Usage in component
const handleSave = async () => {
  const data = prepareExportData(images, labels);
  await saveAnnotations(data);
  toast.success("Saved to server!");
};
```

### Loading Existing Annotations

```tsx
const loadAnnotations = async () => {
  const response = await fetch('/api/annotations');
  const data = await response.json();
  
  setImages(data.images);
  setLabels(data.labels);
};

useEffect(() => {
  loadAnnotations();
}, []);
```

## 🎯 Best Practices

### 1. State Management
- Use `AnnotationContext` for global state
- Keep component state local when possible
- Use hooks for reusable logic

### 2. Performance
- Implement virtual scrolling for large image lists
- Lazy load images with thumbnails
- Debounce frequent operations (zoom, pan)

### 3. Accessibility
- All keyboard shortcuts work without mouse
- Screen reader compatible labels
- Focus management for modals/dialogs

### 4. Testing
```tsx
import { render } from '@testing-library/react';
import { AnnotationProvider } from '@/contexts/AnnotationContext';

const wrapper = ({ children }) => (
  <AnnotationProvider value={mockAnnotationState}>
    {children}
  </AnnotationProvider>
);

test('renders annotation tool', () => {
  render(<AnnotationContent {...props} />, { wrapper });
  // ... assertions
});
```

## 🔍 Debugging

Enable debug mode in development:

```tsx
// src/config/debug.ts
export const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Annotation State:', annotationState);
  console.log('Shortcuts:', shortcuts);
}
```

## 📝 Type Safety

All components are fully typed with TypeScript:

```tsx
import type { 
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox 
} from "@/types/annotation";

const MyComponent = ({ 
  mode 
}: { 
  mode: AnnotationMode 
}) => {
  // Fully type-safe
};
```

## 🚀 Advanced Usage

### Multi-Instance Support

```tsx
// Create separate instances for different datasets
<AnnotationProvider value={dataset1State}>
  <AnnotationTool />
</AnnotationProvider>

<AnnotationProvider value={dataset2State}>
  <AnnotationTool />
</AnnotationProvider>
```

### Plugin System

```tsx
// Register custom plugins
export const plugins = {
  exportFormats: [cocoExport, yoloExport, customExport],
  annotationTools: [boxTool, polygonTool, customTool],
  shortcuts: [defaultShortcuts, customShortcuts],
};
```

## 📦 Export Formats

Built-in support for:
- COCO JSON
- YOLO TXT
- Darknet
- CSV
- Custom formats via `exportFormats.ts`

## 🤝 Contributing

To extend the tool:
1. Add types in `src/types/`
2. Create hooks in `src/hooks/`
3. Add components in `src/components/`
4. Update utilities in `src/lib/`
5. Document in this README

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:
- Check the documentation
- Review example implementations
- Open an issue on GitHub
