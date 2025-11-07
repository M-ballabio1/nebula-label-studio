import { useState, useEffect } from "react";
import {
  AnnotationMode,
  BoundingBox,
} from "@/types/annotation";
import { VideoItem } from "@/types/video";
import { GridMode } from "@/types/gridMode";
import { CanvasTool } from "@/contexts/AnnotationContext";
import { useImages } from "./useImages";
import { useLabels } from "./useLabels";
import { useVideos } from "./useVideos";

export const useAnnotationState = () => {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
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
  const [gridMode, setGridMode] = useState<GridMode>({ maxImages: 1, columns: 2 });
  const [canvasTool, setCanvasTool] = useState<CanvasTool>("draw");
  const [imageTransform, setImageTransform] = useState({
    rotation: 0,
    flipH: false,
    flipV: false,
  });
  const [imageFilters, setImageFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [lockAnnotations, setLockAnnotations] = useState(false);

  const { images, setImages, loading: imagesLoading } = useImages();
  const { labels, setLabels, loading: labelsLoading } = useLabels();
  
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const { 
    selectedVideoId, 
    setSelectedVideoId,
    selectedFrameId,
    setSelectedFrameId,
    selectedVideo,
  } = useVideos(videos, setVideos);

  // Set initial selected label and image when data loads
  useEffect(() => {
    if (labels.length > 0 && !selectedLabelId) {
      setSelectedLabelId(labels[0].id);
    }
  }, [labels, selectedLabelId]);

  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id);
    }
  }, [images, selectedImageId]);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  return {
    mode,
    setMode,
    labels,
    setLabels,
    labelsLoading,
    selectedLabelId,
    setSelectedLabelId,
    images,
    setImages,
    imagesLoading,
    selectedImageId,
    setSelectedImageId,
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
    canvasTool,
    setCanvasTool,
    imageTransform,
    setImageTransform,
    imageFilters,
    setImageFilters,
    showAnnotations,
    setShowAnnotations,
    lockAnnotations,
    setLockAnnotations,
    videos,
    setVideos,
    selectedVideoId,
    setSelectedVideoId,
    selectedFrameId,
    setSelectedFrameId,
    selectedVideo,
  };
};
