import { createContext, useContext, ReactNode } from "react";
import { AnnotationMode, Label, ImageItem, BoundingBox } from "@/types/annotation";
import { GridMode } from "@/types/gridMode";

interface AnnotationContextType {
  // Mode & State
  mode: AnnotationMode;
  setMode: (mode: AnnotationMode) => void;
  gridMode: GridMode;
  setGridMode: (mode: GridMode) => void;
  
  // Labels
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  selectedLabelId: string | null;
  setSelectedLabelId: (id: string | null) => void;
  
  // Images
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;
  selectedImage?: ImageItem;
  
  // Canvas State
  imageDimensions: { width: number; height: number };
  setImageDimensions: (dims: { width: number; height: number }) => void;
  normalizedDimensions: { width: number; height: number };
  setNormalizedDimensions: (dims: { width: number; height: number }) => void;
  selectedBox: BoundingBox | null;
  setSelectedBox: (box: BoundingBox | null) => void;
  hoveredBox: BoundingBox | null;
  setHoveredBox: (box: BoundingBox | null) => void;
  
  // Filters
  filters: { annotated: boolean | null; labelIds: string[] };
  setFilters: (filters: { annotated: boolean | null; labelIds: string[] }) => void;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export const useAnnotationContext = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error("useAnnotationContext must be used within AnnotationProvider");
  }
  return context;
};

interface AnnotationProviderProps {
  children: ReactNode;
  value: AnnotationContextType;
}

export const AnnotationProvider = ({ children, value }: AnnotationProviderProps) => {
  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
};
