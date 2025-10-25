import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [projectName, setProjectName] = useState("Nebula Flow Project");
  const [autoSave, setAutoSave] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConfidence, setShowConfidence] = useState(false);
  const [gridSize, setGridSize] = useState("4");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your annotation workspace and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="annotation">Annotation</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] mt-4">
            <TabsContent value="general" className="space-y-4 pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save annotations as you work
                    </p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Labels on Canvas</Label>
                    <p className="text-sm text-muted-foreground">
                      Display label names on annotations
                    </p>
                  </div>
                  <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Confidence Scores</Label>
                    <p className="text-sm text-muted-foreground">
                      Display confidence percentages for predictions
                    </p>
                  </div>
                  <Switch checked={showConfidence} onCheckedChange={setShowConfidence} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="annotation" className="space-y-4 pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-box-size">Minimum Box Size (px)</Label>
                  <Input
                    id="min-box-size"
                    type="number"
                    defaultValue="10"
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum size for bounding boxes in detection mode
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="polygon-points">Max Polygon Points</Label>
                  <Input
                    id="polygon-points"
                    type="number"
                    defaultValue="100"
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of points per polygon in segmentation mode
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart Polygon Closing</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically close polygons when clicking near start
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Snap to Edges</Label>
                    <p className="text-sm text-muted-foreground">
                      Snap annotations to image edges when close
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interface" className="space-y-4 pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grid-size">Grid View Columns</Label>
                  <Input
                    id="grid-size"
                    type="number"
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value)}
                    min="2"
                    max="6"
                    placeholder="4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of columns in grid view mode
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Thumbnail Gallery</Label>
                    <p className="text-sm text-muted-foreground">
                      Display thumbnail gallery at the bottom
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing and padding throughout the interface
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Zoom Controls</Label>
                    <p className="text-sm text-muted-foreground">
                      Display zoom in/out buttons on canvas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="space-y-4 pr-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Next Image</p>
                    <p className="text-sm text-muted-foreground">Navigate to next image</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    →
                  </kbd>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Previous Image</p>
                    <p className="text-sm text-muted-foreground">Navigate to previous image</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    ←
                  </kbd>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Select Label 1-9</p>
                    <p className="text-sm text-muted-foreground">Quickly select labels</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    1-9
                  </kbd>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Delete Annotation</p>
                    <p className="text-sm text-muted-foreground">Remove selected annotation</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    Del
                  </kbd>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Undo</p>
                    <p className="text-sm text-muted-foreground">Undo last action</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    Ctrl+Z
                  </kbd>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Save</p>
                    <p className="text-sm text-muted-foreground">Save current annotations</p>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">
                    Ctrl+S
                  </kbd>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
