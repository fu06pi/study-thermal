"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db, defaultAppearance, initializeDatabase } from "./db";

export function useStudyData() {
  useEffect(() => { void initializeDatabase(); }, []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const appearance = useLiveQuery(() => db.settings.get("appearance"), []) ?? defaultAppearance;
  return { subjects, sessions, appearance };
}
