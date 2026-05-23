import { ListStyleType, someList, toggleList } from "@platejs/list";
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from "@platejs/link/react";
import { KEYS } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import { Icon } from "@/components/Icon";
import { insertBlock } from "@/components/editor/transforms";
import { pickAndUploadImage } from "@/features/editor/upload";

export function FormatBar() {
  const editor = useEditorRef() as any;

  const isBold = useEditorSelector(
    (e) => (e as any).api.marks?.()?.bold === true,
    []
  );
  const isItalic = useEditorSelector(
    (e) => (e as any).api.marks?.()?.italic === true,
    []
  );
  const isCode = useEditorSelector(
    (e) => (e as any).api.marks?.()?.code === true,
    []
  );
  const isBulleted = useEditorSelector(
    (e) =>
      someList(e as any, [
        ListStyleType.Disc,
        ListStyleType.Circle,
        ListStyleType.Square,
      ]),
    []
  );
  const isNumbered = useEditorSelector(
    (e) =>
      someList(e as any, [
        ListStyleType.Decimal,
        ListStyleType.LowerAlpha,
        ListStyleType.UpperAlpha,
        ListStyleType.LowerRoman,
        ListStyleType.UpperRoman,
      ]),
    []
  );

  const linkState = useLinkToolbarButtonState();
  const { props: linkButtonProps } = useLinkToolbarButton(linkState);

  const insertImage = async () => {
    const url = await pickAndUploadImage();
    if (!url) return;
    editor.tf.insertNodes({
      type: editor.getType(KEYS.img),
      url,
      children: [{ text: "" }],
    });
  };

  return (
    <div
      className="flex h-[42px] flex-none items-center justify-center px-4"
      style={{
        borderBottom: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--canvas) 96%, var(--bg))",
      }}
    >
      <div className="flex w-full max-w-[720px] items-center gap-0.5 overflow-x-auto no-scrollbar">
      <FbBtn title="Heading 1 (⌘⌥1)" onClick={() => editor.tf.h1.toggle()}>
        <FbLabel>H1</FbLabel>
      </FbBtn>
      <FbBtn title="Heading 2 (⌘⌥2)" onClick={() => editor.tf.h2.toggle()}>
        <FbLabel>H2</FbLabel>
      </FbBtn>
      <FbBtn title="Heading 3 (⌘⌥3)" onClick={() => editor.tf.h3.toggle()}>
        <FbLabel>H3</FbLabel>
      </FbBtn>
      <FbBtn title="Heading 4 (⌘⌥4)" onClick={() => editor.tf.h4.toggle()}>
        <FbLabel>H4</FbLabel>
      </FbBtn>
      <FbDivider />
      <FbBtn
        title="Bold (⌘B)"
        active={isBold}
        onClick={() => editor.tf.bold.toggle()}
      >
        <Icon name="bold" size={15} />
      </FbBtn>
      <FbBtn
        title="Italic (⌘I)"
        active={isItalic}
        onClick={() => editor.tf.italic.toggle()}
      >
        <Icon name="italic" size={15} />
      </FbBtn>
      <FbBtn
        title="Inline code (⌘E)"
        active={isCode}
        onClick={() => editor.tf.code.toggle()}
      >
        <Icon name="code" size={16} />
      </FbBtn>
      <FbBtn
        title="Link (⌘K)"
        onClick={(e) => {
          (linkButtonProps as any).onClick?.(e);
        }}
        onMouseDown={(e) => {
          (linkButtonProps as any).onMouseDown?.(e);
          e.preventDefault();
        }}
      >
        <Icon name="link" size={16} />
      </FbBtn>
      <FbDivider />
      <FbBtn
        title="Bulleted list"
        active={isBulleted}
        onClick={() =>
          toggleList(editor, { listStyleType: ListStyleType.Disc })
        }
      >
        <Icon name="list" size={16} />
      </FbBtn>
      <FbBtn
        title="Numbered list"
        active={isNumbered}
        onClick={() =>
          toggleList(editor, { listStyleType: ListStyleType.Decimal })
        }
      >
        <Icon name="listOrd" size={16} />
      </FbBtn>
      <FbBtn
        title="Quote (⌘⇧.)"
        onClick={() => editor.tf.blockquote.toggle()}
      >
        <Icon name="quote" size={16} />
      </FbBtn>
      <FbBtn
        title="Code block (⌘⌥8)"
        onClick={() => editor.tf.codeBlock.toggle()}
      >
        <Icon name="codeBlock" size={16} />
      </FbBtn>
      <FbBtn
        title="Divider"
        onClick={() => insertBlock(editor, KEYS.hr)}
      >
        <Icon name="hr" size={16} />
      </FbBtn>
      <FbBtn
        title="Table"
        onClick={() => insertBlock(editor, KEYS.table)}
      >
        <Icon name="table" size={16} />
      </FbBtn>
      <FbBtn title="Image" onClick={insertImage}>
        <Icon name="image" size={16} />
      </FbBtn>
      <span className="flex-1" />
      <span
        className="mr-2 hidden text-[11px] sm:inline"
        style={{ color: "var(--ink-4)" }}
      >
        Type <kbd
          className="mx-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            background: "color-mix(in oklab, var(--ink) 8%, transparent)",
            color: "var(--ink-2)",
            fontFamily: "var(--font-mono-stack)",
          }}
        >/</kbd>
        for blocks
      </span>
      </div>
    </div>
  );
}

function FbLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-semibold tracking-tight">{children}</span>
  );
}

function FbBtn({
  title,
  children,
  active,
  onClick,
  onMouseDown,
  disabled,
}: {
  title: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onClick?.(e);
      }}
      onMouseDown={(e) => {
        if (onMouseDown) onMouseDown(e);
        else e.preventDefault();
      }}
      disabled={disabled}
      data-on={active ? "1" : "0"}
      className="inline-flex h-[30px] min-w-[30px] flex-none items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 text-[12px] font-semibold hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] hover:text-[var(--ink)] data-[on='1']:bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] data-[on='1']:text-[var(--accent)] disabled:opacity-40"
      style={{ color: "var(--ink-3)" }}
    >
      {children}
    </button>
  );
}

function FbDivider() {
  return (
    <span
      className="inline-block h-[18px] w-px flex-none mx-1.5"
      style={{ background: "var(--hairline-strong)" }}
    />
  );
}
