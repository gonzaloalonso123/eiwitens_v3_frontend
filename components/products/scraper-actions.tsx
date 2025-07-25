"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, AlertTriangle, Check, GripVertical, Clock, Wand2, TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Rogier from "@/images/rogier.webp";
import Image from "next/image";
import Confetti from "react-confetti";

const actionTypes = [
  { value: "click", label: "Click Element" },
  { value: "selectOption", label: "Select Option" },
  { value: "select", label: "Select Text" },
  { value: "wait", label: "Wait" },
];

const defaultAction = {
  id: "",
  type: "click",
  selector: "xpath",
  xpath: "",
  optionText: "",
  duration: 2000,
};

export interface ScraperAction {
  id: string;
  type: "click" | "selectOption" | "select" | "wait";
  selector: "xpath" | "css";
  xpath: string;
  optionText?: string;
  duration?: number;
}

interface ScraperActionsProps {
  value: ScraperAction[];
  onChange: (value: ScraperAction[]) => void;
  disabled?: boolean;
  url: string;
  onTest?: (
    url: string,
    actions: ScraperAction[]
  ) => Promise<{
    price: number;
    error: {
      text: string;
      index: number;
      screenshot: string | null;
    };
    generatedActions?: ScraperAction[];
  }>;
  onUpdateWithAiActions?: (actions: ScraperAction[]) => void;
}

export function ScraperActions({
  value = [],
  onChange,
  disabled = false,
  url,
  onTest,
  onUpdateWithAiActions,
}: ScraperActionsProps) {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    price?: number;
    error?: {
      index: number;
      text: string;
      screenshot?: string;
    };
    generatedActions?: ScraperAction[];
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddAction = () => {
    const newAction = {
      ...defaultAction,
      id: uuidv4(),
    };
    onChange([...value, newAction]);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = [...value];
    newActions.splice(index, 1);
    onChange(newActions);
  };

  const handleUpdateAction = (index: number, field: string, fieldValue: string | number) => {
    const newActions = [...value];
    newActions[index] = {
      ...newActions[index],
      [field]: fieldValue,
    };
    onChange(newActions);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id);
      const newIndex = value.findIndex((item) => item.id === over.id);

      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleUpdateWithAiActions = (generatedActions) => {
    const formattedActions = generatedActions.map((action) => ({
      ...action,
      id: action.id || uuidv4(),
      selector: action.selector || "xpath",
    }));

    onChange(formattedActions);

    if (onUpdateWithAiActions) {
      onUpdateWithAiActions(formattedActions);
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);

  const handleTestScraper = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await onTest(url, value);
      setTestResult({ success: result.price, ...result });
      if (result.price > 0 && !result.generatedActions) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* {showConfetti && <div className="fixed pointer-events-none top-0 left-0"><Confetti width={window.innerWidth} height={window.innerHeight} /></div>} */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {value.map((action, index) => (
            <SortableActionItem
              key={action.id}
              action={action}
              index={index}
              disabled={disabled}
              testResult={testResult}
              onRemove={handleRemoveAction}
              onUpdate={handleUpdateAction}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="outline" onClick={handleAddAction} disabled={disabled} className="w-full" type="button">
        <Plus className="h-4 w-4 mr-2" />
        Add Action
      </Button>

      <Card>
        <CardContent className="pt-4 space-y-10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Image src={Rogier} alt="Scraper" width={40} height={40} className="scale-x-[-1]" />
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <Button
                onClick={handleTestScraper}
                disabled={disabled || testing || value.length === 0 || !onTest}
                className="w-full"
                type="button"
              >
                {testing ? "Testing..." : "Test Scraper Actions"}
              </Button>

              {testResult && testResult.success && testResult.price != 0 && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <AlertDescription className="font-medium">
                      {testResult.price === 0 ? "No price data retrieved" : `Retrieved Price: €${testResult.price}`}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
            {showConfetti &&
              (<div className="flex flex-col items-center justify-center">
                <img src="/sexy-girl.jpeg" alt="Confetti Celebration" className="w-32 h-auto rounded-md" />
                <p className="mt-2 p-2 bg-green-100 rounded-md">Good job handsome</p>
              </div>)
            }
          </div>
          {testResult?.generatedActions && testResult?.generatedActions?.length > 0 ? (
            <div>
              <p className="text-gray-500">
                The AI has generated the following actions based on the page content. You can use these actions to
                replace the existing ones.
              </p>
              <div className="flex gap-4 bg-yellow-200 p-2 rounded-md border border-yellow-400 items-center">
                <TriangleAlert className="h-8 w-8 text-primary mt-4" />
                This means the scraper has failed, make sure to try the provided solution before continuing.
              </div>
              <Button
                onClick={() => handleUpdateWithAiActions(testResult.generatedActions)}
                variant="outline"
                className="mt-2"
                type="button"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Use AI-Generated Action
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

interface SortableActionItemProps {
  action: ScraperAction;
  index: number;
  disabled: boolean;
  testResult: any;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string | number) => void;
}

function SortableActionItem({ action, index, disabled, testResult, onRemove, onUpdate }: SortableActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isError = testResult?.error?.index === index;

  return (
    <div className="space-y-4">
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className={`border ${isError ? "border-destructive" : ""}`}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {!disabled && (
                  <button
                    type="button"
                    className="mr-2 cursor-grab text-muted-foreground hover:text-foreground"
                    {...listeners}
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>
                )}
                {isError && <AlertTriangle className="h-5 w-5 text-destructive mr-2" />}
                <h3 className="font-medium">Action {index + 1}</h3>
              </div>
              <Button variant="outline" size="icon" type="button" onClick={() => onRemove(index)} disabled={disabled}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  disabled={disabled}
                  value={action.type}
                  onValueChange={(value) => onUpdate(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={disabled}
                  value={action.selector}
                  onValueChange={(value) => onUpdate(index, "selector", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select selector type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xpath">By XPATH</SelectItem>
                    <SelectItem value="css">By CSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder={action.selector === "xpath" ? "XPATH" : "CSS Selector"}
                value={action.xpath}
                onChange={(e) => onUpdate(index, "xpath", e.target.value)}
                disabled={disabled}
              />

              {action.type === "selectOption" && (
                <Input
                  placeholder="Option Text"
                  value={action.optionText || ""}
                  onChange={(e) => onUpdate(index, "optionText", e.target.value)}
                  disabled={disabled}
                />
              )}

              {action.type === "wait" && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Duration (ms)"
                    value={action.duration || 2000}
                    onChange={(e) => onUpdate(index, "duration", Number.parseInt(e.target.value))}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isError && <ErrorDisplay error={testResult.error} />}
    </div>
  );
}

function ErrorDisplay({ error }: { error: { text: string; screenshot?: string } }) {
  return (
    <div className="border-2 border-destructive rounded-md overflow-hidden">
      <div className="bg-destructive text-destructive-foreground px-3 py-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Error</span>
      </div>
      <div className="p-4 bg-destructive/10">
        <p className="text-destructive mb-4">{error.text}</p>

        {error.screenshot && (
          <div className="rounded-md overflow-hidden border border-destructive/20">
            <div className="bg-destructive text-destructive-foreground px-3 py-1 text-sm">Error Screenshot</div>
            <div className="bg-background">
              <img src={`data:image/png;base64,${error.screenshot}`} alt="Error Screenshot" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
