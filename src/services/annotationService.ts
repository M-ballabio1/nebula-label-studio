import {
  BoundingBox,
  SegmentationPolygon,
  ClassificationTag,
  AudioSegment,
  TextAnnotation,
} from "@/types/annotation";
import { apiService } from "./api";
import { API_CONFIG } from "@/config/apiConfig";

class AnnotationService {
  // Bounding Boxes
  async createBox(imageId: string, box: Omit<BoundingBox, "id">): Promise<BoundingBox> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return {
        id: `box-${Date.now()}`,
        ...box,
      };
    }

    return apiService.post<BoundingBox>(API_CONFIG.ENDPOINTS.BOXES, {
      imageId,
      ...box,
    });
  }

  async updateBox(id: string, updates: Partial<BoundingBox>): Promise<BoundingBox> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return { id, ...updates } as BoundingBox;
    }

    return apiService.patch<BoundingBox>(
      `${API_CONFIG.ENDPOINTS.BOXES}/${id}`,
      updates
    );
  }

  async deleteBox(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(`${API_CONFIG.ENDPOINTS.BOXES}/${id}`);
  }

  // Polygons
  async createPolygon(
    imageId: string,
    polygon: Omit<SegmentationPolygon, "id">
  ): Promise<SegmentationPolygon> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return {
        id: `polygon-${Date.now()}`,
        ...polygon,
      };
    }

    return apiService.post<SegmentationPolygon>(API_CONFIG.ENDPOINTS.POLYGONS, {
      imageId,
      ...polygon,
    });
  }

  async deletePolygon(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(`${API_CONFIG.ENDPOINTS.POLYGONS}/${id}`);
  }

  // Tags
  async createTag(
    imageId: string,
    tag: ClassificationTag
  ): Promise<ClassificationTag> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return tag;
    }

    return apiService.post<ClassificationTag>(API_CONFIG.ENDPOINTS.TAGS, {
      imageId,
      ...tag,
    });
  }

  async deleteTag(imageId: string, labelId: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(
      `${API_CONFIG.ENDPOINTS.TAGS}/${imageId}/${labelId}`
    );
  }

  // Audio Segments
  async createAudioSegment(
    segment: Omit<AudioSegment, "id">
  ): Promise<AudioSegment> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return {
        id: `segment-${Date.now()}`,
        ...segment,
      };
    }

    return apiService.post<AudioSegment>(
      API_CONFIG.ENDPOINTS.AUDIO_SEGMENTS,
      segment
    );
  }

  async deleteAudioSegment(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(
      API_CONFIG.ENDPOINTS.AUDIO_SEGMENT_BY_ID(id)
    );
  }

  // Text Annotations
  async createTextAnnotation(
    annotation: Omit<TextAnnotation, "id">
  ): Promise<TextAnnotation> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return {
        id: `text-ann-${Date.now()}`,
        ...annotation,
      };
    }

    return apiService.post<TextAnnotation>(
      API_CONFIG.ENDPOINTS.TEXT_ANNOTATIONS,
      annotation
    );
  }

  async deleteTextAnnotation(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return;
    }

    return apiService.delete<void>(
      API_CONFIG.ENDPOINTS.TEXT_ANNOTATION_BY_ID(id)
    );
  }
}

export const annotationService = new AnnotationService();
