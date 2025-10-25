import { useState } from "react";
import {
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox,
  AudioSegment,
  TextAnnotation,
} from "@/types/annotation";
import { GridMode } from "@/types/gridMode";
import { INITIAL_LABELS, SAMPLE_IMAGES } from "@/config/sampleData";

export const useAnnotationState = () => {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [labels, setLabels] = useState<Label[]>(INITIAL_LABELS);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(
    INITIAL_LABELS[0]?.id || null
  );
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    SAMPLE_IMAGES[0]?.id || null
  );
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [normalizedDimensions, setNormalizedDimensions] = useState({ width: 0, height: 0 });
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);
  const [segmentationImageDimensions, setSegmentationImageDimensions] = useState<{
    original: { width: number; height: number };
    normalized: { width: number; height: number };
  } | null>(null);
  const [filters, setFilters] = useState<{ annotated: boolean | null; labelIds: string[] }>({
    annotated: null,
    labelIds: [],
  });
  const [gridMode, setGridMode] = useState<GridMode>("single");

  const selectedImage = images.find((img) => img.id === selectedImageId);

  return {
    mode,
    setMode,
    labels,
    setLabels,
    selectedLabelId,
    setSelectedLabelId,
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    audioSegments,
    setAudioSegments,
    textAnnotations,
    setTextAnnotations,
    imageDimensions,
    setImageDimensions,
    normalizedDimensions,
    setNormalizedDimensions,
    selectedBox,
    setSelectedBox,
    hoveredBox,
    setHoveredBox,
    segmentationImageDimensions,
    setSegmentationImageDimensions,
    filters,
    setFilters,
    gridMode,
    setGridMode,
    selectedImage,
  };
};
