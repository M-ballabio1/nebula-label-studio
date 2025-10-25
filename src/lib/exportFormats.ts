import { ImageItem, Label, BoundingBox, SegmentationPolygon, ClassificationTag } from "@/types/annotation";

export type ExportFormat = "coco" | "yolo" | "darknet" | "cvat" | "csv";

// COCO Format Export
export const exportCOCO = (images: ImageItem[], labels: Label[]) => {
  const cocoFormat = {
    info: {
      description: "Exported from Annotation Tool",
      version: "1.0",
      year: new Date().getFullYear(),
      date_created: new Date().toISOString(),
    },
    licenses: [],
    images: images.map((img, idx) => ({
      id: idx + 1,
      file_name: img.name,
      width: 800, // You might want to get actual dimensions
      height: 600,
    })),
    annotations: [] as any[],
    categories: labels.map((label, idx) => ({
      id: idx + 1,
      name: label.name,
      supercategory: "object",
    })),
  };

  let annotationId = 1;
  images.forEach((img, imgIdx) => {
    // Bounding boxes
    img.annotations.boxes?.forEach((box) => {
      const labelIdx = labels.findIndex((l) => l.id === box.labelId);
      cocoFormat.annotations.push({
        id: annotationId++,
        image_id: imgIdx + 1,
        category_id: labelIdx + 1,
        bbox: [box.x, box.y, box.width, box.height],
        area: box.width * box.height,
        iscrowd: 0,
      });
    });

    // Segmentation polygons
    img.annotations.polygons?.forEach((poly) => {
      const labelIdx = labels.findIndex((l) => l.id === poly.labelId);
      const segmentation = poly.points.flatMap((p) => [p.x, p.y]);
      cocoFormat.annotations.push({
        id: annotationId++,
        image_id: imgIdx + 1,
        category_id: labelIdx + 1,
        segmentation: [segmentation],
        area: calculatePolygonArea(poly.points),
        bbox: calculateBoundingBox(poly.points),
        iscrowd: 0,
      });
    });
  });

  return JSON.stringify(cocoFormat, null, 2);
};

// YOLO Format Export (one file per image)
export const exportYOLO = (images: ImageItem[], labels: Label[]) => {
  const files: Record<string, string> = {};

  // Create classes.txt
  files["classes.txt"] = labels.map((l) => l.name).join("\n");

  // Create annotation files for each image
  images.forEach((img) => {
    const lines: string[] = [];
    const imgWidth = 800; // Get actual dimensions
    const imgHeight = 600;

    img.annotations.boxes?.forEach((box) => {
      const labelIdx = labels.findIndex((l) => l.id === box.labelId);
      const xCenter = (box.x + box.width / 2) / imgWidth;
      const yCenter = (box.y + box.height / 2) / imgHeight;
      const width = box.width / imgWidth;
      const height = box.height / imgHeight;
      lines.push(`${labelIdx} ${xCenter} ${yCenter} ${width} ${height}`);
    });

    img.annotations.polygons?.forEach((poly) => {
      const labelIdx = labels.findIndex((l) => l.id === poly.labelId);
      const normalizedPoints = poly.points
        .flatMap((p) => [p.x / imgWidth, p.y / imgHeight])
        .join(" ");
      lines.push(`${labelIdx} ${normalizedPoints}`);
    });

    const fileName = img.name.replace(/\.[^/.]+$/, ".txt");
    files[fileName] = lines.join("\n");
  });

  return files;
};

// Darknet Format Export (similar to YOLO but with different structure)
export const exportDarknet = (images: ImageItem[], labels: Label[]) => {
  const files: Record<string, string> = {};

  // Create obj.names
  files["obj.names"] = labels.map((l) => l.name).join("\n");

  // Create obj.data
  files["obj.data"] = `classes = ${labels.length}\ntrain = train.txt\nvalid = valid.txt\nnames = obj.names\nbackup = backup/`;

  // Create train.txt with image paths
  const trainPaths = images.map((img) => `data/obj/${img.name}`).join("\n");
  files["train.txt"] = trainPaths;

  // Create annotation files
  images.forEach((img) => {
    const lines: string[] = [];
    const imgWidth = 800;
    const imgHeight = 600;

    img.annotations.boxes?.forEach((box) => {
      const labelIdx = labels.findIndex((l) => l.id === box.labelId);
      const xCenter = (box.x + box.width / 2) / imgWidth;
      const yCenter = (box.y + box.height / 2) / imgHeight;
      const width = box.width / imgWidth;
      const height = box.height / imgHeight;
      lines.push(`${labelIdx} ${xCenter} ${yCenter} ${width} ${height}`);
    });

    const fileName = img.name.replace(/\.[^/.]+$/, ".txt");
    files[fileName] = lines.join("\n");
  });

  return files;
};

// CSV Format Export
export const exportCSV = (images: ImageItem[], labels: Label[], mode: string) => {
  let csv = "";

  if (mode === "detection") {
    csv = "image_name,label,x,y,width,height\n";
    images.forEach((img) => {
      img.annotations.boxes?.forEach((box) => {
        const label = labels.find((l) => l.id === box.labelId);
        csv += `${img.name},${label?.name},${box.x},${box.y},${box.width},${box.height}\n`;
      });
    });
  } else if (mode === "segmentation") {
    csv = "image_name,label,points\n";
    images.forEach((img) => {
      img.annotations.polygons?.forEach((poly) => {
        const label = labels.find((l) => l.id === poly.labelId);
        const points = poly.points.map((p) => `${p.x},${p.y}`).join(";");
        csv += `${img.name},${label?.name},"${points}"\n`;
      });
    });
  } else if (mode === "classification") {
    csv = "image_name,labels\n";
    images.forEach((img) => {
      const labelNames = img.annotations.tags
        ?.map((tag) => labels.find((l) => l.id === tag.labelId)?.name)
        .filter(Boolean)
        .join(";");
      csv += `${img.name},"${labelNames}"\n`;
    });
  }

  return csv;
};

// Helper functions
const calculatePolygonArea = (points: { x: number; y: number }[]) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

const calculateBoundingBox = (points: { x: number; y: number }[]) => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return [minX, minY, maxX - minX, maxY - minY];
};

// Download helper
export const downloadFile = (content: string, filename: string, type: string = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download multiple files as zip (mock implementation)
export const downloadMultipleFiles = (files: Record<string, string>, zipName: string) => {
  // In a real implementation, you would use JSZip library
  // For now, we'll just download each file separately
  Object.entries(files).forEach(([filename, content]) => {
    downloadFile(content, filename);
  });
};
