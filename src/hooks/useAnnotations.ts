import { useState } from "react";
import {
  BoundingBox,
  SegmentationPolygon,
  AudioSegment,
  TextAnnotation,
  ImageItem,
} from "@/types/annotation";
import { annotationService } from "@/services/annotationService";
import { toast } from "sonner";

export const useAnnotations = (
  images: ImageItem[],
  setImages: (images: ImageItem[]) => void,
  selectedImageId: string | null
) => {
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);

  // Bounding Boxes
  const addBox = async (box: Omit<BoundingBox, "id">): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      const newBox = await annotationService.createBox(selectedImageId, box);
      setImages(
        images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotations: {
                  ...img.annotations,
                  boxes: [...(img.annotations.boxes || []), newBox],
                },
              }
            : img
        )
      );
      toast.success("Bounding box added");
      return true;
    } catch (err) {
      toast.error("Failed to add bounding box");
      return false;
    }
  };

  const updateBox = async (
    id: string,
    updates: Partial<BoundingBox>
  ): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      await annotationService.updateBox(id, updates);
      setImages(
        images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotations: {
                  ...img.annotations,
                  boxes: (img.annotations.boxes || []).map((b) =>
                    b.id === id ? { ...b, ...updates } : b
                  ),
                },
              }
            : img
        )
      );
      return true;
    } catch (err) {
      toast.error("Failed to update bounding box");
      return false;
    }
  };

  const deleteBox = async (id: string): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      await annotationService.deleteBox(id);
      setImages(
        images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotations: {
                  ...img.annotations,
                  boxes: (img.annotations.boxes || []).filter((b) => b.id !== id),
                },
              }
            : img
        )
      );
      toast.success("Bounding box deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete bounding box");
      return false;
    }
  };

  // Polygons
  const addPolygon = async (
    polygon: Omit<SegmentationPolygon, "id">
  ): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      const newPolygon = await annotationService.createPolygon(
        selectedImageId,
        polygon
      );
      setImages(
        images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotations: {
                  ...img.annotations,
                  polygons: [...(img.annotations.polygons || []), newPolygon],
                },
              }
            : img
        )
      );
      toast.success("Polygon added");
      return true;
    } catch (err) {
      toast.error("Failed to add polygon");
      return false;
    }
  };

  const deletePolygon = async (id: string): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      await annotationService.deletePolygon(id);
      setImages(
        images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotations: {
                  ...img.annotations,
                  polygons: (img.annotations.polygons || []).filter(
                    (p) => p.id !== id
                  ),
                },
              }
            : img
        )
      );
      toast.success("Polygon deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete polygon");
      return false;
    }
  };

  // Tags
  const toggleTag = async (labelId: string): Promise<boolean> => {
    if (!selectedImageId) return false;

    try {
      const image = images.find((img) => img.id === selectedImageId);
      if (!image) return false;

      const hasTag = image.annotations.tags?.some((t) => t.labelId === labelId);

      if (hasTag) {
        await annotationService.deleteTag(selectedImageId, labelId);
      } else {
        await annotationService.createTag(selectedImageId, { labelId });
      }

      setImages(
        images.map((img) => {
          if (img.id !== selectedImageId) return img;
          const tags = img.annotations.tags || [];
          return {
            ...img,
            annotations: {
              ...img.annotations,
              tags: hasTag
                ? tags.filter((t) => t.labelId !== labelId)
                : [...tags, { labelId }],
            },
          };
        })
      );
      return true;
    } catch (err) {
      toast.error("Failed to toggle tag");
      return false;
    }
  };

  // Audio Segments
  const addAudioSegment = async (
    segment: Omit<AudioSegment, "id">
  ): Promise<boolean> => {
    try {
      const newSegment = await annotationService.createAudioSegment(segment);
      setAudioSegments((prev) => [...prev, newSegment]);
      toast.success("Audio segment added");
      return true;
    } catch (err) {
      toast.error("Failed to add audio segment");
      return false;
    }
  };

  const deleteAudioSegment = async (id: string): Promise<boolean> => {
    try {
      await annotationService.deleteAudioSegment(id);
      setAudioSegments((prev) => prev.filter((s) => s.id !== id));
      toast.success("Audio segment deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete audio segment");
      return false;
    }
  };

  // Text Annotations
  const addTextAnnotation = async (
    annotation: Omit<TextAnnotation, "id">
  ): Promise<boolean> => {
    try {
      const newAnnotation = await annotationService.createTextAnnotation(
        annotation
      );
      setTextAnnotations((prev) => [...prev, newAnnotation]);
      toast.success("Text annotation added");
      return true;
    } catch (err) {
      toast.error("Failed to add text annotation");
      return false;
    }
  };

  const deleteTextAnnotation = async (id: string): Promise<boolean> => {
    try {
      await annotationService.deleteTextAnnotation(id);
      setTextAnnotations((prev) => prev.filter((a) => a.id !== id));
      toast.success("Text annotation deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete text annotation");
      return false;
    }
  };

  return {
    audioSegments,
    setAudioSegments,
    textAnnotations,
    setTextAnnotations,
    addBox,
    updateBox,
    deleteBox,
    addPolygon,
    deletePolygon,
    toggleTag,
    addAudioSegment,
    deleteAudioSegment,
    addTextAnnotation,
    deleteTextAnnotation,
  };
};
