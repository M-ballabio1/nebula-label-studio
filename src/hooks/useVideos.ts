import { useState, useCallback } from "react";
import { VideoItem, VideoFrame } from "@/types/video";
import { toast } from "sonner";

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File): Promise<VideoItem | null> => {
    try {
      // Create video URL
      const url = URL.createObjectURL(file);

      // Get video metadata
      const video = document.createElement("video");
      video.src = url;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      const newVideo: VideoItem = {
        id: `video_${Date.now()}`,
        url,
        name: file.name,
        duration: video.duration,
        fps: 30, // Default FPS, could be detected from video
        frames: [],
        currentFrameId: null,
      };

      setVideos((prev) => [...prev, newVideo]);
      setSelectedVideoId(newVideo.id);
      toast.success("Video uploaded successfully");
      return newVideo;
    } catch (err) {
      toast.error("Failed to upload video");
      return null;
    }
  }, []);

  const deleteVideo = useCallback((id: string): boolean => {
    try {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (selectedVideoId === id) {
        setSelectedVideoId(null);
        setSelectedFrameId(null);
      }
      toast.success("Video deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete video");
      return false;
    }
  }, [selectedVideoId]);

  const addFrameToVideo = useCallback((videoId: string, frame: VideoFrame) => {
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === videoId) {
          // Check if frame already exists
          const frameExists = video.frames.some((f) => f.id === frame.id);
          if (frameExists) {
            toast.info("Frame already extracted");
            return video;
          }
          return {
            ...video,
            frames: [...video.frames, frame],
          };
        }
        return video;
      })
    );
    toast.success(`Frame extracted successfully`);
  }, []);

  const removeFrameFromVideo = useCallback((videoId: string, frameId: string) => {
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === videoId) {
          return {
            ...video,
            frames: video.frames.filter((f) => f.id !== frameId),
          };
        }
        return video;
      })
    );
    if (selectedFrameId === frameId) {
      setSelectedFrameId(null);
    }
    toast.success("Frame removed");
  }, [selectedFrameId]);

  const selectedVideo = videos.find((v) => v.id === selectedVideoId);
  const selectedFrame = selectedVideo?.frames.find((f) => f.id === selectedFrameId);

  return {
    videos,
    setVideos,
    selectedVideoId,
    setSelectedVideoId,
    selectedFrameId,
    setSelectedFrameId,
    selectedVideo,
    selectedFrame,
    uploadVideo,
    deleteVideo,
    addFrameToVideo,
    removeFrameFromVideo,
  };
};
