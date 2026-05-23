'use client';

import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTableColumn,
  insertTableRow,
} from '@platejs/table';
import {
  ArrowDownToLine,
  ArrowRightToLine,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { type PlateElementProps, PlateElement, useEditorRef } from 'platejs/react';

export function TableElement(props: PlateElementProps) {
  return (
    <div className="group/table relative my-4 pt-9">
      <div className="prose-doc-table-scroll overflow-x-auto">
        <PlateElement
          as="table"
          className="border-collapse"
          style={{ width: '100%', minWidth: 'max-content' }}
          {...props}
        >
          <tbody>{props.children}</tbody>
        </PlateElement>
      </div>
      <TableActions />
    </div>
  );
}

export function TableRowElement(props: PlateElementProps) {
  return <PlateElement as="tr" {...props} />;
}

export function TableCellElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="td"
      className="border p-2 align-top"
      style={{ minWidth: 96 }}
      {...props}
    />
  );
}

export function TableCellHeaderElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="th"
      className="border p-2 text-left align-top font-semibold"
      style={{ minWidth: 96 }}
      {...props}
    />
  );
}

function TableActions() {
  const editor = useEditorRef();

  const run = (fn: (e: typeof editor) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn(editor);
  };

  return (
    <div
      contentEditable={false}
      className="pointer-events-none absolute right-0 top-0 flex select-none items-center gap-0.5 rounded-md p-0.5 opacity-0 shadow-sm transition-opacity duration-150 group-hover/table:pointer-events-auto group-hover/table:opacity-100 group-focus-within/table:pointer-events-auto group-focus-within/table:opacity-100"
      style={{
        background: 'var(--canvas)',
        border: '0.5px solid var(--hairline-strong)',
      }}
    >
      <ActBtn
        title="Add row below"
        onMouseDown={run((ed) => insertTableRow(ed))}
      >
        <ArrowDownToLine size={13} />
        <Plus size={11} />
      </ActBtn>
      <ActBtn title="Delete row" onMouseDown={run((ed) => deleteRow(ed))}>
        <ArrowDownToLine size={13} />
        <Minus size={11} />
      </ActBtn>
      <Sep />
      <ActBtn
        title="Add column right"
        onMouseDown={run((ed) => insertTableColumn(ed))}
      >
        <ArrowRightToLine size={13} />
        <Plus size={11} />
      </ActBtn>
      <ActBtn
        title="Delete column"
        onMouseDown={run((ed) => deleteColumn(ed))}
      >
        <ArrowRightToLine size={13} />
        <Minus size={11} />
      </ActBtn>
      <Sep />
      <ActBtn
        title="Delete table"
        danger
        onMouseDown={run((ed) => deleteTable(ed))}
      >
        <Trash2 size={13} />
      </ActBtn>
    </div>
  );
}

function ActBtn({
  children,
  onMouseDown,
  title,
  danger,
}: {
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      title={title}
      onMouseDown={onMouseDown}
      onClick={(e) => e.preventDefault()}
      className={
        'inline-flex h-6 items-center gap-0.5 rounded-[4px] border-0 bg-transparent px-1.5 text-[11px] font-medium ' +
        (danger
          ? 'hover:bg-destructive hover:text-destructive-foreground'
          : 'hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]')
      }
      style={{ color: 'var(--ink-2)' }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <span
      className="mx-0.5 inline-block h-3 w-px"
      style={{ background: 'var(--hairline-strong)' }}
    />
  );
}
