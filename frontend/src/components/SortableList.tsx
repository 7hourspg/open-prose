import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** A row that participates in vertical sorting. Use the spread `dragHandle`
 *  on whichever element should be the drag source (typically a grip icon). */
export type SortableRowRender<T> = (args: {
  item: T;
  index: number;
  isDragging: boolean;
  /** Spread on the grip element to make it the drag handle. */
  dragHandle: {
    ref: (el: HTMLElement | null) => void;
    onPointerDown?: React.PointerEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    "aria-roledescription"?: string;
    role?: string;
    tabIndex?: number;
    style?: CSSProperties;
  };
}) => ReactNode;

type Props<T> = {
  items: T[];
  setItems: (next: T[]) => void;
  /** A stable per-item key. Required by dnd-kit. */
  getId: (item: T, index: number) => string;
  renderRow: SortableRowRender<T>;
};

export function SortableList<T>({ items, setItems, getId, renderRow }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = items.map((it, i) => getId(it, i));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    setItems(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableRow key={ids[i]} id={ids[i]} render={renderRow} item={item} index={i} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableRow<T>({
  id,
  item,
  index,
  render,
}: {
  id: string;
  item: T;
  index: number;
  render: SortableRowRender<T>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const wrapperStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const dragHandle = {
    ref: setActivatorNodeRef,
    ...attributes,
    ...listeners,
    style: { cursor: "grab", touchAction: "none" } as CSSProperties,
  };

  return (
    <div ref={setNodeRef} style={wrapperStyle}>
      {render({ item, index, isDragging, dragHandle })}
    </div>
  );
}
