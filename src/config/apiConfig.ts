// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "/api",
  ENDPOINTS: {
    // Images
    IMAGES: "/images",
    IMAGE_BY_ID: (id: string) => `/images/${id}`,
    IMAGE_UPLOAD: "/images/upload",
    
    // Labels
    LABELS: "/labels",
    LABEL_BY_ID: (id: string) => `/labels/${id}`,
    
    // Annotations
    ANNOTATIONS: "/annotations",
    ANNOTATION_BY_ID: (id: string) => `/annotations/${id}`,
    BOXES: "/annotations/boxes",
    POLYGONS: "/annotations/polygons",
    TAGS: "/annotations/tags",
    
    // Audio
    AUDIO_SEGMENTS: "/audio/segments",
    AUDIO_SEGMENT_BY_ID: (id: string) => `/audio/segments/${id}`,
    
    // Text
    TEXT_ANNOTATIONS: "/text/annotations",
    TEXT_ANNOTATION_BY_ID: (id: string) => `/text/annotations/${id}`,
    
    // Export
    EXPORT: "/export",
  },
  // Feature flags
  USE_MOCK_DATA: true, // Set to false when API is ready
};
