'use client';

import * as React from 'react';

import type { PlateEditor, PlateElementProps } from 'platejs/react';

import {
  Code2,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ImageIcon,
  ListIcon,
  ListOrdered,
  Minus,
  PilcrowIcon,
  Quote,
  Square,
  TableIcon,
} from 'lucide-react';
import { type TComboboxInputElement, KEYS } from 'platejs';
import { PlateElement } from 'platejs/react';

import { insertBlock } from '@/components/editor/transforms';
import { pickAndUploadImage } from '@/features/editor/upload';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type Group = {
  group: string;
  items: {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
  }[];
};

const groups: Group[] = [
  {
    group: 'Blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ['paragraph'],
        label: 'Text',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        value: KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        value: KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        keywords: ['h3'],
        label: 'Heading 3',
        value: KEYS.h3,
      },
      {
        icon: <Heading4Icon />,
        keywords: ['h4'],
        label: 'Heading 4',
        value: KEYS.h4,
      },
      {
        icon: <ListIcon />,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        value: KEYS.ul,
      },
      {
        icon: <ListOrdered />,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        value: KEYS.ol,
      },
      {
        icon: <Square />,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        label: 'To-do list',
        value: KEYS.listTodo,
      },
      {
        icon: <Quote />,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        label: 'Blockquote',
        value: KEYS.blockquote,
      },
      {
        icon: <Code2 />,
        keywords: ['```'],
        label: 'Code block',
        value: KEYS.codeBlock,
      },
      {
        icon: <Minus />,
        keywords: ['horizontal rule', 'divider', 'hr', '---'],
        label: 'Divider',
        value: KEYS.hr,
      },
      {
        icon: <TableIcon />,
        keywords: ['grid', 'rows', 'columns'],
        label: 'Table',
        value: KEYS.table,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  {
    group: 'Media',
    items: [
      {
        icon: <ImageIcon />,
        keywords: ['picture', 'photo', 'media', 'upload'],
        label: 'Image',
        value: KEYS.img,
        onSelect: async (editor) => {
          const url = await pickAndUploadImage();
          if (!url) return;
          editor.tf.insertNodes({
            type: editor.getType(KEYS.img),
            url,
            children: [{ text: '' }],
          });
        },
      },
    ],
  },
];

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="mr-2 text-muted-foreground">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
