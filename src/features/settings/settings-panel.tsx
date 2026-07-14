"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, Plus, Trash2, Upload, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { db } from "@/features/study/db";
import type { AppearanceSettings, BackgroundKind, Subject } from "@/features/study/types";
import { exportBackup, importBackup } from "./backup";

export function SettingsPanel({ settings, subjects, onClose }: { settings: AppearanceSettings; subjects: Subject[]; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const update = (changes: Partial<AppearanceSettings>) => void db.settings.update("appearance", changes);
  const readBackgroundFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setMessage("Could not read that file.");
    reader.onload = () => update({ backgroundValue: String(reader.result) });
    if (settings.backgroundKind === "lottie") reader.readAsText(file);
    else reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.aside initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#14151b]/95 p-6 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div><h2 className="text-lg font-semibold text-ink">Settings</h2><p className="mt-1 text-xs text-muted">Keep the room quiet.</p></div>
          <button className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink" onClick={onClose} aria-label="Close settings"><X size={18} /></button>
        </div>

        <SettingsGroup title="Appearance">
          <label className="setting-row">Accent <input type="color" value={settings.accent} onChange={(event) => update({ accent: event.target.value })} /></label>
          <label className="setting-row">Background
            <select value={settings.backgroundKind} onChange={(event) => update({ backgroundKind: event.target.value as BackgroundKind, backgroundValue: event.target.value === "gradient" ? "linear-gradient(145deg, #11131a, #181525 48%, #0d1117)" : "" })}>
              <option value="gradient">Gradient</option><option value="image">Image</option><option value="video">Video</option><option value="lottie">Lottie JSON</option>
            </select>
          </label>
          {settings.backgroundKind !== "gradient" && <label className="block rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-muted hover:border-white/20">Choose {settings.backgroundKind} file<input className="hidden" type="file" accept={settings.backgroundKind === "lottie" ? ".json,application/json" : `${settings.backgroundKind}/*`} onChange={(event) => readBackgroundFile(event.target.files?.[0])} /></label>}
          {(["brightness", "blur", "overlay"] as const).map((key) => <label key={key} className="block text-xs capitalize text-muted"><span className="mb-2 flex justify-between"><span>{key}</span><span>{settings[key]}{key === "blur" ? "px" : "%"}</span></span><input className="w-full accent-[var(--accent-hex)]" type="range" min="0" max={key === "blur" ? 24 : 100} value={settings[key]} onChange={(event) => update({ [key]: Number(event.target.value) })} /></label>)}
        </SettingsGroup>

        <SettingsGroup title="Subjects">
          <p className="text-xs leading-5 text-muted">Names support all input methods. Changes are saved on this device.</p>
          {subjects.map((subject) => <SubjectRow key={subject.id} subject={subject} canDelete={subjects.length > 1} />)}
          <Button className="w-full" variant="ghost" onClick={() => void db.subjects.add({ id: crypto.randomUUID(), name: "New subject", color: settings.accent, dailyGoalMinutes: 60, createdAt: new Date().toISOString() })}><Plus size={15} /> Add subject</Button>
        </SettingsGroup>

        <SettingsGroup title="Backup">
          <div className="grid grid-cols-2 gap-2"><Button onClick={() => void exportBackup()}><Download size={15} /> Export</Button><Button onClick={() => importRef.current?.click()}><Upload size={15} /> Import</Button></div>
          <input ref={importRef} className="hidden" type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file).then(() => setMessage("Backup imported.")).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Import failed.")); }} />
          {message && <p className="text-xs text-muted" role="status">{message}</p>}
        </SettingsGroup>
      </motion.aside>
    </div>
  );
}

function SubjectRow({ subject, canDelete }: { subject: Subject; canDelete: boolean }) {
  const [name, setName] = useState(subject.name);
  useEffect(() => setName(subject.name), [subject.name]);
  const saveName = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== subject.name) void db.subjects.update(subject.id, { name: trimmedName });
    else setName(subject.name);
  };
  const deleteSubject = async () => {
    if (!canDelete || !window.confirm(`Delete ${subject.name} and all of its study history?`)) return;
    await db.transaction("rw", db.subjects, db.sessions, async () => {
      await db.sessions.where("subjectId").equals(subject.id).delete();
      await db.subjects.delete(subject.id);
    });
  };

  return (
    <div className="grid grid-cols-[32px_1fr_80px_36px] gap-2">
      <input
        type="color"
        value={subject.color}
        aria-label={`${subject.name} color`}
        onChange={(event) => void db.subjects.update(subject.id, { color: event.target.value })}
      />
      <input
        value={name}
        aria-label={`${subject.name} name`}
        onChange={(event) => setName(event.target.value)}
        onCompositionEnd={(event) => setName(event.currentTarget.value)}
        onBlur={saveName}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      />
      <label className="relative">
        <input className="w-full pr-7" type="number" min="1" value={subject.dailyGoalMinutes} aria-label={`${subject.name} daily goal`} onChange={(event) => void db.subjects.update(subject.id, { dailyGoalMinutes: Math.max(1, Number(event.target.value)) })} />
        <span className="pointer-events-none absolute right-2 top-2.5 text-[10px] text-muted">min</span>
      </label>
      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={!canDelete}
        onClick={() => void deleteSubject()}
        aria-label={`Delete ${subject.name}`}
        title={canDelete ? `Delete ${subject.name}` : "Keep at least one subject"}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-8 space-y-4"><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>{children}</section>;
}
