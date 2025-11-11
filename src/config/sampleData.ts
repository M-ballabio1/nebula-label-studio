import { Label, ImageItem } from "@/types/annotation";

export const INITIAL_LABELS: Label[] = [
  { id: "1", name: "Person", color: "#ef4444", hotkey: "1" },
  { id: "2", name: "Car", color: "#3b82f6", hotkey: "2" },
  { id: "3", name: "Building", color: "#22c55e", hotkey: "3" },
  { id: "4", name: "Tree", color: "#f59e0b", hotkey: "4" },
];

export const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: "img1",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop",
    name: "City Street",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img2",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=120&h=120&fit=crop",
    name: "Mountain View",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img3",
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=120&h=120&fit=crop",
    name: "Urban Night",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img4",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=120&fit=crop",
    name: "Nature Scene",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img5",
    url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=120&h=120&fit=crop",
    name: "Sunset Beach",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img6",
    url: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=120&h=120&fit=crop",
    name: "Dining Room",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img7",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop",
    name: "Mountain Peak",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img8",
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=120&h=120&fit=crop",
    name: "Mountain Reflection",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img9",
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=120&h=120&fit=crop",
    name: "Forest Trail",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img10",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=120&h=120&fit=crop",
    name: "Foggy Mountains",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img11",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=120&h=120&fit=crop",
    name: "Autumn Road",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img12",
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=120&h=120&fit=crop",
    name: "Mountain Lake",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img13",
    url: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=120&h=120&fit=crop",
    name: "Beach Waves",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img14",
    url: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=120&h=120&fit=crop",
    name: "Desert Road",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img15",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=120&h=120&fit=crop",
    name: "Ice Mountains",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img16",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=120&h=120&fit=crop",
    name: "Valley View",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img17",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&h=120&fit=crop",
    name: "Green Forest",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img18",
    url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=120&h=120&fit=crop",
    name: "Northern Lights",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img19",
    url: "https://images.unsplash.com/photo-1496275068113-fff8c90750d1?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1496275068113-fff8c90750d1?w=120&h=120&fit=crop",
    name: "Ocean Sunset",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img20",
    url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=120&h=120&fit=crop",
    name: "Snow Peak",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
];

export const SAMPLE_AUDIO_URL = "/assets/dvc_mice.wav";

export const SAMPLE_TEXT = "Natural Language Processing (NLP) is a subfield of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate objective of NLP is to read, decipher, understand, and make sense of human languages in a manner that is valuable. Most NLP techniques rely on machine learning to derive meaning from human languages. NLP is used to apply algorithms to identify and extract the natural language rules such that unstructured language data is converted into a form that computers can understand.";

export const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
