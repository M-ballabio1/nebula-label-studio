export interface GridMode {
  maxImages: number;
  columns: number;
}

export const isMultiGrid = (gridMode: GridMode) => gridMode.maxImages > 1;
