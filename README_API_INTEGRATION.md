# API Integration Guide

This document explains how to integrate real API endpoints into the Multi-Modal Annotation Platform.

## Current Architecture

The application is structured with a clean separation between mock data and API calls:

### Configuration
- `src/config/apiConfig.ts` - Central API configuration with endpoints and feature flags
- `src/config/sampleData.ts` - Mock data (images, labels, etc.)

### Services Layer
All API calls are centralized in service classes:

- `src/services/api.ts` - Base API service with HTTP methods
- `src/services/imageService.ts` - Image management API
- `src/services/labelService.ts` - Label management API  
- `src/services/annotationService.ts` - Annotation operations API

### Hooks Layer
Custom hooks abstract data fetching and state management:

- `src/hooks/useImages.ts` - Image data and operations
- `src/hooks/useLabels.ts` - Label data and operations
- `src/hooks/useAnnotations.ts` - Annotation data and operations
- `src/hooks/useAnnotationState.ts` - Main state orchestration
- `src/hooks/useAnnotationHandlers.ts` - Event handlers
- `src/hooks/useImageFilters.ts` - Image filtering logic
- `src/hooks/useImageNavigation.ts` - Navigation logic
- `src/hooks/useGridAnnotationHandlers.ts` - Grid view handlers
- `src/hooks/useHotkeys.ts` - Keyboard shortcuts

### Components Layer
Presentation components receive props from hooks:

- `src/components/SidebarContent.tsx` - Sidebar orchestration
- `src/components/AnnotationContent.tsx` - Main content orchestration
- `src/components/Grid*.tsx` - Grid view components

## Switching from Mock to Real API

### Step 1: Update API Configuration

Edit `src/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://your-api-domain.com/api", // Your API URL
  USE_MOCK_DATA: false, // Set to false to use real API
  // ... endpoints remain the same
};
```

### Step 2: Implement Backend Endpoints

Your backend needs to implement these endpoints:

#### Images Endpoints
```
GET    /api/images                    - List images with filters
POST   /api/images/upload             - Upload new image
GET    /api/images/:id                - Get image by ID
PATCH  /api/images/:id                - Update image
DELETE /api/images/:id                - Delete image
```

#### Labels Endpoints
```
GET    /api/labels                    - List all labels
POST   /api/labels                    - Create new label
GET    /api/labels/:id                - Get label by ID
PATCH  /api/labels/:id                - Update label
DELETE /api/labels/:id                - Delete label
```

#### Annotations Endpoints
```
POST   /api/annotations/boxes         - Create bounding box
PATCH  /api/annotations/boxes/:id     - Update bounding box
DELETE /api/annotations/boxes/:id     - Delete bounding box

POST   /api/annotations/polygons      - Create polygon
DELETE /api/annotations/polygons/:id  - Delete polygon

POST   /api/annotations/tags          - Create tag
DELETE /api/annotations/tags/:imageId/:labelId - Delete tag

POST   /api/audio/segments            - Create audio segment
DELETE /api/audio/segments/:id        - Delete audio segment

POST   /api/text/annotations          - Create text annotation
DELETE /api/text/annotations/:id      - Delete text annotation
```

### Step 3: API Response Formats

#### Image Response
```typescript
{
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  annotations: {
    boxes: BoundingBox[];
    polygons: SegmentationPolygon[];
    tags: ClassificationTag[];
  };
}
```

#### Label Response
```typescript
{
  id: string;
  name: string;
  color: string;
  hotkey?: string;
}
```

#### Bounding Box
```typescript
{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  labelId: string;
}
```

#### Polygon
```typescript
{
  id: string;
  points: Array<{ x: number; y: number }>;
  labelId: string;
}
```

### Step 4: Authentication (Optional)

To add authentication, modify `src/services/api.ts`:

```typescript
private getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(), // Add auth headers
    },
  });
  // ...
}
```

### Step 5: Error Handling

The `ApiService` class already handles errors. Customize error handling in services:

```typescript
async getImages(params?: ImageListParams): Promise<ImageListResponse> {
  try {
    return apiService.get<ImageListResponse>(API_CONFIG.ENDPOINTS.IMAGES, params);
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific error codes
      if (error.status === 401) {
        // Redirect to login
      }
    }
    throw error;
  }
}
```

## Testing the Integration

1. **Development Mode**: Keep `USE_MOCK_DATA: true` during development
2. **Integration Testing**: Set `USE_MOCK_DATA: false` and point to staging API
3. **Production**: Use production API URL with `USE_MOCK_DATA: false`

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_USE_MOCK_DATA=false
```

Update `src/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "/api",
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === "true",
  // ...
};
```

## Additional Integrations

### Using Supabase (Lovable Cloud)

If using Lovable Cloud/Supabase:

1. Enable Lovable Cloud in your project
2. Create database tables for images, labels, and annotations
3. Update services to use Supabase client instead of fetch
4. Enable RLS policies for security

### Using Custom Backend

For a custom backend (Node.js, Python, etc.):

1. Implement REST API with the endpoints above
2. Add CORS configuration
3. Implement authentication/authorization
4. Add rate limiting and security measures

## Deployment Checklist

- [ ] API endpoints implemented and tested
- [ ] Authentication configured
- [ ] CORS properly configured
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] File upload limits set
- [ ] Environment variables configured
- [ ] `USE_MOCK_DATA` set to `false`
- [ ] Production API URL configured
- [ ] SSL/TLS enabled on API
- [ ] Monitoring and logging setup

## Support

For questions or issues with API integration, refer to:
- Service files in `src/services/`
- Hook implementations in `src/hooks/`
- API configuration in `src/config/apiConfig.ts`
