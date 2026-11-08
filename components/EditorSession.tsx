"use client";

import { createContext, useContext } from "react";

export const EditorSession = createContext<((url: string, init?: RequestInit) => Promise<Response>) | null>(null);
export function useEditorRequest() {
  const request = useContext(EditorSession);
  if (!request) throw new Error("Editor session is unavailable.");
  return request;
}
