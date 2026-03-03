"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Workspace } from "@/lib/types/database.types";

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspaceState] =
    useState<Workspace | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("activeWorkspace");
    if (stored) {
      try {
        setActiveWorkspaceState(JSON.parse(stored));
      } catch {
        // Ignore invalid JSON in localStorage
      }
    }
  }, []);

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem("activeWorkspace", JSON.stringify(workspace));
  }, []);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used within WorkspaceProvider"
    );
  }
  return context;
}
