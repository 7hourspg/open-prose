'use client';

import { TrailingBlockPlugin } from '@platejs/utils';

import { BasicNodesKit } from '@/components/editor/plugins/basic-nodes-kit';
import { CodeBlockKit } from '@/components/editor/plugins/code-block-kit';
import { FloatingToolbarKit } from '@/components/editor/plugins/floating-toolbar-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { MediaKit } from '@/components/editor/plugins/media-kit';
import { SlashKit } from '@/components/editor/plugins/slash-kit';
import { TableKit } from '@/components/editor/plugins/table-kit';

export const EditorKit = [
  ...BasicNodesKit,
  ...ListKit,
  ...LinkKit,
  ...CodeBlockKit,
  ...MediaKit,
  ...TableKit,
  ...SlashKit,
  ...FloatingToolbarKit,
  ...MarkdownKit,
  TrailingBlockPlugin,
];
