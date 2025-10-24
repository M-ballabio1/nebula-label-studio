export interface VideoFrame {
  id: string;
  frameNumber: number;
  timestamp: number;
  imageUrl: string;
  thumbnailUrl: string;
}

export interface VideoItem {
  id: string;
  url: string;
  name: string;
  duration: number;
  fps: number;
  frames: VideoFrame[];
  currentFrameId: string | null;
}
