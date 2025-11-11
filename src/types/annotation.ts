export type AnnotationMode = "detection" | "classification" | "segmentation" | "audio" | "text" | "video";

export interface Label {
  id: string;
  name: string;
  color: string;
  hotkey?: string;
}

export interface BoundingBox {
  id: string;
  x: number; // Normalized coordinate (0-1) relative to original image width
  y: number; // Normalized coordinate (0-1) relative to original image height
  width: number; // Normalized width (0-1) relative to original image width
  height: number; // Normalized height (0-1) relative to original image height
  labelId: string;
}

export interface SegmentationPoint {
  x: number; // Normalized coordinate (0-1) relative to original image width
  y: number; // Normalized coordinate (0-1) relative to original image height
}

export interface SegmentationPolygon {
  id: string;
  points: SegmentationPoint[];
  labelId: string;
}

export interface ClassificationTag {
  labelId: string;
  confidence?: number;
}

export interface AudioSegment {
  id: string;
  startTime: number;
  endTime: number;
  labelId: string;
}

export interface TextAnnotation {
  id: string;
  startIndex: number;
  endIndex: number;
  labelId: string;
  text: string;
}

export interface ImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  annotations: {
    boxes?: BoundingBox[];
    polygons?: SegmentationPolygon[];
    tags?: ClassificationTag[];
  };
}

export interface AudioItem {
  id: string;
  url: string;
  name: string;
  duration: number;
  annotations: AudioSegment[];
}

export interface TextItem {
  id: string;
  content: string;
  name: string;
  annotations: TextAnnotation[];
}

export interface PDFItem {
  id: string;
  file: File;
  name: string;
  annotations: {
    text: TextAnnotation[];
    boxes: BoundingBox[];
  };
}
