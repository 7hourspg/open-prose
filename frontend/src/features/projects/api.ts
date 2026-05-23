import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateProject,
  DeleteProject,
  DuplicateProject,
  ListProjects,
  ListTemplates,
  OpenProject,
  RenameProject,
  SaveProject,
} from "../../../wailsjs/go/api/App";
import { domain } from "../../../wailsjs/go/models";
import { qk } from "@/lib/query-client";

export function useProjects() {
  return useQuery({
    queryKey: qk.projects,
    queryFn: () => ListProjects(),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: qk.templates,
    queryFn: () => ListTemplates(),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.project(id) : qk.project("__none__"),
    queryFn: () => (id ? OpenProject(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, template }: { name: string; template: string }) =>
      CreateProject(name, template),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DuplicateProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DeleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

export function useRenameProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      RenameProject(id, name),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.projects });
      qc.invalidateQueries({ queryKey: qk.project(vars.id) });
    },
  });
}

export function useSaveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (project: domain.Project) => SaveProject(project),
    onSuccess: (_d, project) => {
      qc.invalidateQueries({ queryKey: qk.project(project.meta.id) });
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}
