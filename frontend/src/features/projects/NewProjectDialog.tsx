import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Modal } from "@/components/window/Modal";
import { Pill } from "@/components/window/Toolbar";
import { Icon } from "@/components/Icon";
import { TEMPLATE_THUMB_ASPECT, TemplateThumb } from "@/components/TemplateThumb";
import { useCreateProject } from "@/features/projects/api";
import { CreatePost } from "../../../wailsjs/go/api/App";
import { domain } from "../../../wailsjs/go/models";
import { genId, slugify } from "@/lib/project";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TEMPLATES = [
  { id: "minimal", name: "Minimal" },
  { id: "magazine", name: "Magazine" },
  { id: "developer", name: "Developer" },
];

export function NewProjectDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const create = useCreateProject();

  const [name, setName] = useState("");
  const [tpl, setTpl] = useState("minimal");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName("");
    setTpl("minimal");
    setBusy(false);
  };
  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const meta = await create.mutateAsync({
        name: name.trim(),
        template: tpl,
      });
      const starterId = genId("post");
      const starter = {
        id: starterId,
        title: "Hello, world",
        slug: slugify("Hello, world"),
        description: "",
        content:
          "# Hello, world\n\nThis is your first post. Replace this content with whatever you want.\n",
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as domain.Post;
      const saved = await CreatePost(meta.id, starter);
      handleClose();
      navigate({
        to: "/projects/$projectId/posts/$postId",
        params: { projectId: meta.id, postId: saved.id },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      icon={<Icon name="plus" size={16} />}
      title="New site"
      footer={
        <>
          <Pill ghost onClick={handleClose}>
            Cancel
          </Pill>
          <Pill onClick={handleCreate} disabled={busy || !name.trim()}>
            Create site
          </Pill>
        </>
      }
    >
      <div className="px-4 pb-1">
        <Field label="Name">
          <input
            autoFocus
            placeholder="My new blog"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[30px] w-full rounded-[7px] px-2.5 text-[13px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
        </Field>

        <div className="mt-3">
          <div
            className="mb-1.5 text-[12.5px] font-medium"
            style={{ color: "var(--ink-2)" }}
          >
            Template
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTpl(t.id)}
                data-on={tpl === t.id ? "1" : "0"}
                className="flex flex-col gap-2 rounded-[10px] p-2.5 text-left data-[on='1']:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_16%,transparent)]"
                style={{
                  border: `0.5px solid ${
                    tpl === t.id ? "var(--accent)" : "var(--hairline-strong)"
                  }`,
                  background: "var(--canvas)",
                }}
              >
                <div
                  className="overflow-hidden rounded-[7px]"
                  style={{
                    aspectRatio: TEMPLATE_THUMB_ASPECT,
                    border: "0.5px solid var(--hairline)",
                  }}
                >
                  <TemplateThumb template={t.id} name={name || "My blog"} />
                </div>
                <div
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold capitalize"
                  style={{ color: "var(--ink)" }}
                >
                  {t.name}
                  {tpl === t.id && (
                    <span
                      className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full text-white"
                      style={{ background: "var(--accent)", fontSize: 9 }}
                    >
                      <Icon name="check" size={8} />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3.5 py-2.5">
      <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}
