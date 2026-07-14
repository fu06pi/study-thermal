"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Download, Plus, Trash2, Upload, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { db } from "@/features/study/db";
import type { AppearanceSettings, BackgroundKind, Subject } from "@/features/study/types";
import { useTimerStore } from "@/features/timer/store";
import { hexToHsv, hsvToHex, type HsvColor } from "@/lib/color";
import { exportBackup, importBackup } from "./backup";
import auroraDrift from "./lottie/aurora-drift.json";
import breathingGrid from "./lottie/breathing-grid.json";
import orbitalFocus from "./lottie/orbital-focus.json";

const lottiePresets = [
  { name: "Aurora", value: JSON.stringify(auroraDrift), preview: "linear-gradient(135deg, #8b8cf8, #3cd3bc, #f472b6)" },
  { name: "Orbit", value: JSON.stringify(orbitalFocus), preview: "radial-gradient(circle, #f472b6, #8b8cf8 38%, #171923 42%)" },
  { name: "Grid", value: JSON.stringify(breathingGrid), preview: "linear-gradient(135deg, #1c1d2d, #3cd3bc55, #8b8cf855)" },
] as const;

export function SettingsPanel({ settings, subjects, onClose }: { settings: AppearanceSettings; subjects: Subject[]; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const update = (changes: Partial<AppearanceSettings>) => void db.settings.update("appearance", changes);
  const setBackgroundKind = (backgroundKind: BackgroundKind) => update({
    backgroundKind,
    backgroundValue: backgroundKind === "gradient"
      ? "linear-gradient(145deg, #11131a, #181525 48%, #0d1117)"
      : backgroundKind === "lottie" ? lottiePresets[0].value : "",
  });
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
      <motion.aside initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-[100dvh] w-full max-w-md overflow-y-auto bg-[#14151b]/95 p-4 shadow-2xl sm:border-l sm:border-white/10 sm:p-6">
        <div className="mb-8 flex items-center justify-between">
          <div><h2 className="text-lg font-semibold text-ink">Settings</h2><p className="mt-1 text-xs text-muted">Keep the room quiet.</p></div>
          <button className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink" onClick={onClose} aria-label="Close settings"><X size={18} /></button>
        </div>

        <SettingsGroup title="Appearance">
          <div className="setting-row"><span>Accent</span><ColorPicker value={settings.accent} label="Accent color" align="right" onChange={(accent) => update({ accent })} /></div>
          <label className="setting-row">Background
            <select value={settings.backgroundKind} onChange={(event) => setBackgroundKind(event.target.value as BackgroundKind)}>
              <option value="gradient">Gradient</option><option value="image">Image</option><option value="video">Video</option><option value="lottie">Lottie JSON</option>
            </select>
          </label>
          {settings.backgroundKind === "lottie" && (
            <div className="grid grid-cols-3 gap-2">
              {lottiePresets.map((preset) => (
                <button key={preset.name} type="button" className={`rounded-xl border p-2 text-[11px] transition ${settings.backgroundValue === preset.value ? "border-accent bg-accent/10 text-ink" : "border-white/10 text-muted hover:border-white/20"}`} aria-pressed={settings.backgroundValue === preset.value} onClick={() => update({ backgroundValue: preset.value })}>
                  <span className="mb-2 block h-10 rounded-lg" style={{ background: preset.preview }} />
                  {preset.name}
                </button>
              ))}
            </div>
          )}
          {settings.backgroundKind !== "gradient" && <label className="block rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-muted hover:border-white/20">{settings.backgroundKind === "lottie" ? "Upload custom Lottie JSON" : `Choose ${settings.backgroundKind} file`}<input className="hidden" type="file" accept={settings.backgroundKind === "lottie" ? ".json,application/json" : `${settings.backgroundKind}/*`} onChange={(event) => readBackgroundFile(event.target.files?.[0])} /></label>}
          {(["brightness", "blur", "overlay"] as const).map((key) => <label key={key} className="block text-xs capitalize text-muted"><span className="mb-2 flex justify-between"><span>{key}</span><span>{settings[key]}{key === "blur" ? "px" : "%"}</span></span><input className="w-full accent-[var(--accent-hex)]" type="range" min="0" max={key === "blur" ? 24 : 100} value={settings[key]} onChange={(event) => update({ [key]: Number(event.target.value) })} /></label>)}
        </SettingsGroup>

        <SettingsGroup title="Subjects">
          <p className="text-xs leading-5 text-muted">Names support all input methods. Changes are saved on this device.</p>
          {subjects.map((subject) => <SubjectRow key={subject.id} subject={subject} />)}
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

function SubjectRow({ subject }: { subject: Subject }) {
  const [name, setName] = useState(subject.name);
  useEffect(() => setName(subject.name), [subject.name]);
  const saveName = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== subject.name) void db.subjects.update(subject.id, { name: trimmedName });
    else setName(subject.name);
  };
  const deleteSubject = async () => {
    if (!window.confirm(`Delete ${subject.name} and all of its study history?`)) return;
    const timer = useTimerStore.getState();
    if (timer.subjectId === subject.id) timer.reset();
    await db.transaction("rw", db.subjects, db.sessions, async () => {
      await db.sessions.where("subjectId").equals(subject.id).delete();
      await db.subjects.delete(subject.id);
    });
  };

  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)_76px_36px] gap-2 sm:grid-cols-[32px_minmax(0,1fr)_80px_36px]">
      <ColorPicker
        value={subject.color}
        label={`${subject.name} color`}
        onChange={(color) => void db.subjects.update(subject.id, { color })}
      />
      <input
        className="min-w-0"
        value={name}
        aria-label={`${subject.name} name`}
        onChange={(event) => setName(event.target.value)}
        onCompositionEnd={(event) => setName(event.currentTarget.value)}
        onBlur={saveName}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      />
      <label className="relative min-w-0">
        <input className="w-full pr-7" type="number" min="1" value={subject.dailyGoalMinutes} aria-label={`${subject.name} daily goal`} onChange={(event) => void db.subjects.update(subject.id, { dailyGoalMinutes: Math.max(1, Number(event.target.value)) })} />
        <span className="pointer-events-none absolute right-2 top-2.5 text-[10px] text-muted">min</span>
      </label>
      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
        onClick={() => void deleteSubject()}
        aria-label={`Delete ${subject.name}`}
        title={`Delete ${subject.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function ColorPicker({ value, label, onChange, align = "left" }: { value: string; label: string; onChange: (color: string) => void; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [hex, setHex] = useState(value);
  useEffect(() => { setHsv(hexToHsv(value)); setHex(value); }, [value]);

  const commit = (next: HsvColor) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };
  const pickSaturation = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.type === "pointermove" && !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    if (event.type === "pointerdown") event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    commit({
      hue: hsv.hue,
      saturation: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      value: Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height)),
    });
  };
  const commitHex = () => {
    if (/^#[0-9a-f]{6}$/i.test(hex)) onChange(hex.toLowerCase());
    else setHex(value);
  };

  return (
    <div className="relative h-9 w-8">
      <button type="button" className="h-9 w-8 rounded-lg border border-white/10 shadow-inner" style={{ background: value }} aria-label={label} aria-expanded={open} onClick={() => setOpen((current) => !current)} />
      {open && (
        <div className={`absolute top-11 z-40 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#1c1d25] p-3 shadow-2xl ${align === "right" ? "right-0 max-[360px]:-right-8" : "left-0"}`}>
          <div
            className="relative h-36 w-full touch-none cursor-crosshair overflow-hidden rounded-lg"
            style={{ backgroundColor: `hsl(${hsv.hue} 100% 50%)`, backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)" }}
            onPointerDown={pickSaturation}
            onPointerMove={pickSaturation}
          >
            <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${hsv.saturation * 100}%`, top: `${(1 - hsv.value) * 100}%`, background: value }} />
          </div>
          <input
            className="color-hue-slider mt-3 w-full"
            type="range"
            min="0"
            max="359"
            value={Math.round(hsv.hue)}
            aria-label={`${label} hue`}
            onChange={(event) => commit({ ...hsv, hue: Number(event.target.value) })}
          />
          <div className="mt-3 flex items-center gap-2">
            <span className="h-8 w-8 shrink-0 rounded-lg border border-white/10" style={{ background: value }} />
            <input
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-2 text-xs uppercase text-ink outline-none focus:border-white/20"
              value={hex}
              aria-label={`${label} hex value`}
              maxLength={7}
              spellCheck={false}
              onChange={(event) => setHex(event.target.value)}
              onBlur={commitHex}
              onKeyDown={(event) => event.key === "Enter" && commitHex()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-8 space-y-4"><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>{children}</section>;
}
