import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================================================
// Tree Pebbling — Gradient × Flux ÷ Friction (ask Mini-visual)
// Slimmed single-page demo: Single mode + Compare + Presets +
// Share/Export + Self-tests + Zoomable canvas.
// =============================================================

// -------------------- Types --------------------
type NodeT = { id: number; depth: number; x: number; y: number };
type EdgeT = { from: number; to: number };

type Step = { type: "place" | "remove" | "compute"; node: number; note: string };

type CapPolicy = "evict" | "strict" | "none";

type Built = {
  nodes: NodeT[];
  edges: EdgeT[];
  childrenMap: Map<number, number[]>;
  schedules: Record<ScheduleKey, Step[]>;
};

type ScheduleKey = "reversible" | "baseline" | "partial";

type PresetKey =
  | "balanced"
  | "gpu_training"
  | "external_sort"
  | "zk_proving"
  | "embedded_edge"
  | "throughput_server";

// -------------------- Layout --------------------
function layoutTree(h: number) {
  const nodes: NodeT[] = [];
  const edges: EdgeT[] = [];
  let id = 0;
  function build(depth: number, x: number, y: number): number {
    const myId = id++;
    nodes.push({ id: myId, depth, x, y });
    if (depth < h) {
      const dx = 220 / (depth + 1);
      const dy = 110;
      const leftId = build(depth + 1, x - dx, y + dy);
      const rightId = build(depth + 1, x + dx, y + dy);
      edges.push({ from: myId, to: leftId });
      edges.push({ from: myId, to: rightId });
    }
    return myId;
  }
  build(0, 300, 30);
  return { nodes, edges };
}

function deriveChildren(nodes: NodeT[], edges: EdgeT[]) {
  const children = new Map<number, number[]>();
  for (const n of nodes) children.set(n.id, []);
  for (const e of edges) children.get(e.from)!.push(e.to);
  return children;
}

// -------------------- Schedule generators --------------------
function buildSchedules(children: Map<number, number[]>, root = 0): Record<ScheduleKey, Step[]> {
  const rev: Step[] = [];
  const base: Step[] = [];
  const partial: Step[] = [];

  function genReversible(id: number) {
    const kids = children.get(id) || [];
    if (kids.length === 0) {
      rev.push({ type: "place", node: id, note: `Leaf ${id}` });
      return;
    }
    genReversible(kids[0]);
    genReversible(kids[1]);
    rev.push({ type: "compute", node: id, note: `Compute ${id} from ${kids[0]},${kids[1]}` });
    rev.push({ type: "remove", node: kids[0], note: `Uncompute ${kids[0]}` });
    rev.push({ type: "remove", node: kids[1], note: `Uncompute ${kids[1]}` });
  }

  function genBaseline(id: number) {
    const kids = children.get(id) || [];
    if (kids.length === 0) {
      base.push({ type: "place", node: id, note: `Leaf ${id}` });
      return;
    }
    genBaseline(kids[0]);
    genBaseline(kids[1]);
    base.push({ type: "compute", node: id, note: `Compute ${id} from ${kids[0]},${kids[1]}` });
    // no cleanup → higher peak space
  }

  function genPartial(id: number) {
    const kids = children.get(id) || [];
    if (kids.length === 0) {
      partial.push({ type: "place", node: id, note: `Leaf ${id}` });
      return;
    }
    genPartial(kids[0]);
    genPartial(kids[1]);
    partial.push({ type: "compute", node: id, note: `Compute ${id} from ${kids[0]},${kids[1]}` });
    // partial cleanup: drop only left child to show middle ground
    partial.push({ type: "remove", node: kids[0], note: `Uncompute ${kids[0]}` });
  }

  genReversible(root);
  genBaseline(root);
  genPartial(root);

  // optional root cleanup in reversible
  const kidsOfRoot = children.get(root) || [];
  if (kidsOfRoot.length === 2) {
    rev.push({ type: "remove", node: kidsOfRoot[0], note: `Clean ${kidsOfRoot[0]}` });
    rev.push({ type: "remove", node: kidsOfRoot[1], note: `Clean ${kidsOfRoot[1]}` });
  }

  return { reversible: rev, baseline: base, partial };
}

// -------------------- Simulator for tests/metrics --------------------
function depthMap(nodes: NodeT[]) {
  const m = new Map<number, number>();
  for (const n of nodes) m.set(n.id, n.depth);
  return m;
}

function simulateSchedule(
  schedule: Step[],
  nodes: NodeT[],
  edges: EdgeT[],
  K: number,
  capPolicy: CapPolicy
) {
  const children = deriveChildren(nodes, edges);
  const dmap = depthMap(nodes);
  const pebbled = new Set<number>();
  const computed = new Set<number>();
  let flux = 0;
  let recomputeCount = 0;
  let capOK = true;
  let childrenOK = true;
  let peak = 0;
  const seen = new Set<number>();

  const deepestOf = () => [...pebbled].sort((a, b) => dmap.get(b)! - dmap.get(a)!)[0];

  const ensureCapacity = (needed = 1) => {
    if (capPolicy === "none") return;
    while (pebbled.size + needed > K) {
      if (capPolicy === "strict") {
        capOK = false;
        return;
      }
      const deepest = deepestOf();
      if (deepest === undefined) return;
      pebbled.delete(deepest);
    }
  };

  for (const s of schedule) {
    flux++;
    if (s.type === "place") {
      if (seen.has(s.node)) recomputeCount++;
      seen.add(s.node);
      ensureCapacity(1);
      pebbled.add(s.node);
    } else if (s.type === "remove") {
      pebbled.delete(s.node);
      computed.delete(s.node);
    } else if (s.type === "compute") {
      const kids = children.get(s.node) || [];
      if (kids.length > 0) for (const k of kids) if (!pebbled.has(k)) childrenOK = false;
      ensureCapacity(1);
      pebbled.add(s.node);
      computed.add(s.node);
    }
    if (capPolicy !== "none" && pebbled.size > K) capOK = false;
    peak = Math.max(peak, pebbled.size);
  }

  const leavesClear = nodes.every((n) => (children.get(n.id) || []).length === 0 ? !pebbled.has(n.id) : true);
  const rootComputed = computed.has(0);

  return { flux, capOK, childrenOK, leavesClear, rootComputed, peak, recomputeCount };
}

function simulatePrefix(
  schedule: Step[],
  nodes: NodeT[],
  edges: EdgeT[],
  K: number,
  capPolicy: CapPolicy,
  upto: number
) {
  const dmap = depthMap(nodes);
  const pebbled = new Set<number>();
  const computed = new Set<number>();
  let step = 0;
  const deepestOf = () => [...pebbled].sort((a, b) => dmap.get(b)! - dmap.get(a)!)[0];
  for (const s of schedule) {
    if (step >= upto) break;
    step++;
    if (s.type === "place") {
      if (capPolicy !== "none" && pebbled.size >= K && deepestOf() !== undefined) pebbled.delete(deepestOf());
      pebbled.add(s.node);
    } else if (s.type === "remove") {
      pebbled.delete(s.node);
      computed.delete(s.node);
    } else if (s.type === "compute") {
      if (capPolicy !== "none" && pebbled.size >= K && deepestOf() !== undefined) pebbled.delete(deepestOf());
      pebbled.add(s.node);
      computed.add(s.node);
    }
  }
  return { pebbled, computed };
}

// -------------------- React App --------------------
export default function App() {
  // Height
  const [H, setH] = useState(2);

  // Build tree + schedules
  const built: Built = useMemo(() => {
    const { nodes, edges } = layoutTree(H);
    const childrenMap = deriveChildren(nodes, edges);
    const schedules = buildSchedules(childrenMap, 0);
    return { nodes, edges, childrenMap, schedules };
  }, [H]);

  const { nodes, edges, childrenMap, schedules } = built;

  // Settings
  const [K, setK] = useState(3);
  const [capPolicy, setCapPolicy] = useState<CapPolicy>("evict");
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(0.2);
  const [gamma, setGamma] = useState(0.1);

  const PRESETS: Record<PresetKey, { alpha: number; beta: number; gamma: number; blurb: string }> = {
    balanced: { alpha: 0.8, beta: 0.5, gamma: 0.4, blurb: "General-purpose balance of space/time/recompute." },
    gpu_training: { alpha: 1.2, beta: 0.3, gamma: 0.5, blurb: "VRAM tight; recompute acceptable (checkpointing)." },
    external_sort: { alpha: 0.9, beta: 0.2, gamma: 1.3, blurb: "IO/rehash costly; penalize recompute." },
    zk_proving: { alpha: 1.1, beta: 0.4, gamma: 1.0, blurb: "Memory + re-derivations are expensive." },
    embedded_edge: { alpha: 1.5, beta: 0.2, gamma: 0.3, blurb: "Tiny RAM; accept more moves." },
    throughput_server: { alpha: 0.3, beta: 1.2, gamma: 0.3, blurb: "Moves (latency) dominate cost." },
  };
  const [preset, setPreset] = useState<PresetKey>("balanced");

  function applyPreset(key: PresetKey) {
    setPreset(key);
    const p = PRESETS[key];
    setAlpha(p.alpha);
    setBeta(p.beta);
    setGamma(p.gamma);
  }

  // Single-run state
  const [scheduleKey, setScheduleKey] = useState<ScheduleKey>("reversible");
  const activeSchedule = schedules[scheduleKey];
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [speedMs] = useState(800);

  // Shareable URL params
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const h = parseInt(q.get("H") || "");
      if (!isNaN(h)) setH(Math.max(2, Math.min(8, h)));
      const k = parseInt(q.get("K") || "");
      if (!isNaN(k)) setK(Math.max(2, Math.min(64, k)));
      const cap = q.get("cap") as CapPolicy | null;
      if (cap === "evict" || cap === "strict" || cap === "none") setCapPolicy(cap);
      const sk = q.get("schedule") as ScheduleKey | null;
      if (sk && (sk === "reversible" || sk === "baseline" || sk === "partial")) setScheduleKey(sk);
      const pr = q.get("preset") as PresetKey | null;
      if (pr && PRESETS[pr]) applyPreset(pr);
      const pa = parseFloat(q.get("alpha") || "");
      const pb = parseFloat(q.get("beta") || "");
      const pg = parseFloat(q.get("gamma") || "");
      if (!isNaN(pa)) setAlpha(pa);
      if (!isNaN(pb)) setBeta(pb);
      if (!isNaN(pg)) setGamma(pg);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildParams() {
    const qp = new URLSearchParams();
    qp.set("H", String(H));
    qp.set("K", String(K));
    qp.set("cap", capPolicy);
    qp.set("preset", preset);
    qp.set("alpha", String(alpha));
    qp.set("beta", String(beta));
    qp.set("gamma", String(gamma));
    qp.set("schedule", scheduleKey);
    return qp;
  }

  const [copied, setCopied] = useState<string | null>(null);
  async function copyShareURL() {
    const url = `${window.location.origin}${window.location.pathname}?${buildParams().toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied("Link copied!");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied("Copy failed");
      setTimeout(() => setCopied(null), 1500);
    }
  }

  async function copyDecisionMarkdown() {
    const lines: string[] = [];
    lines.push(`# Pebble-Bridge Decision`);
    lines.push("");
    lines.push(`Tree height **H=${H}**, K=**${K}**, cap=**${capPolicy}**.`);
    lines.push(`Weights: α=${alpha}, β=${beta}, γ=${gamma} (preset: ${preset}).`);
    lines.push("");
    const m = simulateSchedule(activeSchedule, nodes, edges, K, capPolicy);
    const cost = alpha * m.peak + beta * m.flux + gamma * m.recomputeCount;
    lines.push(`Schedule **${scheduleKey.toUpperCase()}**`);
    lines.push("");
    lines.push(`- Peak: **${m.peak}**\n- Flux: **${m.flux}**\n- Recomputation: **${m.recomputeCount}**\n- Children OK: ${m.childrenOK ? "✅" : "❌"}\n- Root computed: ${m.rootComputed ? "✅" : "❌"}`);
    lines.push("");
    lines.push(`**Cost** = α·peak + β·flux + γ·recompute = **${cost.toFixed(2)}**`);
    lines.push("");
    lines.push(`Cyclic_6: Seed → Couple → Pump → Spill → Uncompute → Certify.`);
    lines.push(`Cost model: cost = α·peak + β·flux + γ·recompute.`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied("Summary copied!");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied("Copy failed");
      setTimeout(() => setCopied(null), 1500);
    }
  }

  // Playback
  useEffect(() => setStepIdx(0), [H, scheduleKey, capPolicy, K]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStepIdx((s) => Math.min(s + 1, activeSchedule.length)), 800);
    return () => window.clearInterval(id);
  }, [running, activeSchedule.length]);

  // Metrics (current schedule)
  const singleMetrics = useMemo(() => simulateSchedule(activeSchedule, nodes, edges, K, capPolicy), [activeSchedule, nodes, edges, K, capPolicy]);
  const singleCost = useMemo(() => alpha * singleMetrics.peak + beta * singleMetrics.flux + gamma * singleMetrics.recomputeCount, [singleMetrics, alpha, beta, gamma]);

  // Leaderboard across all schedules at current K/cap
  const M_rev = useMemo(() => simulateSchedule(schedules.reversible, nodes, edges, K, capPolicy), [schedules.reversible, nodes, edges, K, capPolicy]);
  const M_base = useMemo(() => simulateSchedule(schedules.baseline, nodes, edges, K, capPolicy), [schedules.baseline, nodes, edges, K, capPolicy]);
  const M_part = useMemo(() => simulateSchedule(schedules.partial, nodes, edges, K, capPolicy), [schedules.partial, nodes, edges, K, capPolicy]);
  const C_rev = alpha * M_rev.peak + beta * M_rev.flux + gamma * M_rev.recomputeCount;
  const C_base = alpha * M_base.peak + beta * M_base.flux + gamma * M_base.recomputeCount;
  const C_part = alpha * M_part.peak + beta * M_part.flux + gamma * M_part.recomputeCount;
  const leaderboard = useMemo(() => {
    const arr = [
      { key: "reversible" as ScheduleKey, cost: C_rev },
      { key: "baseline" as ScheduleKey, cost: C_base },
      { key: "partial" as ScheduleKey, cost: C_part },
    ].sort((a, b) => a.cost - b.cost);
    return { winner: arr[0].key, rows: arr };
  }, [C_rev, C_base, C_part]);

  // Visual prefix state
  const { pebbled: Psingle, computed: Csingle } = useMemo(() => simulatePrefix(activeSchedule, nodes, edges, K, capPolicy, stepIdx), [activeSchedule, nodes, edges, K, capPolicy, stepIdx]);

  // -------------------- Self-tests --------------------
  const tests = useMemo(() => {
    const t = simulateSchedule(activeSchedule, nodes, edges, K, capPolicy);
    const baselineNC = simulateSchedule(schedules.baseline, nodes, edges, 9999, "none");
    const reversibleNC = simulateSchedule(schedules.reversible, nodes, edges, 9999, "none");
    return [
      { name: `Children pebbled before compute (${scheduleKey}, K=${K}, ${capPolicy})`, pass: t.childrenOK, detail: `${t.childrenOK}` },
      { name: `Cap respected (${scheduleKey}, K=${K}, ${capPolicy})`, pass: t.capOK, detail: `${t.capOK}` },
      { name: `No leaves pebbled at end (${scheduleKey})`, pass: t.leavesClear, detail: `${t.leavesClear}` },
      { name: `Root computed (${scheduleKey})`, pass: t.rootComputed, detail: `${t.rootComputed}` },
      { name: `Reversible peak ≤ Baseline peak (no cap)`, pass: reversibleNC.peak <= baselineNC.peak, detail: `${reversibleNC.peak} ≤ ${baselineNC.peak}` },
      { name: `Flux equals schedule length`, pass: t.flux === activeSchedule.length, detail: `${t.flux}/${activeSchedule.length}` },
    ];
  }, [activeSchedule, nodes, edges, K, capPolicy, scheduleKey, schedules]);

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 via-zinc-900 to-slate-900 text-zinc-100 p-6">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        <header className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Tree Pebbling • <span className="text-emerald-300">Gradient × Flux ÷ Friction</span></h1>
          <p className="text-sm opacity-80">Tune your memory budget (<strong>K</strong>) and cost weights (<strong>α</strong> space, <strong>β</strong> moves, <strong>γ</strong> recompute). Compare schedules and export a decision summary.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={copyShareURL} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Share link</button>
            <button onClick={copyDecisionMarkdown} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Export decision (md)</button>
            {copied && <span className="text-xs opacity-80 ml-2">{copied}</span>}
          </div>
        </header>

        {/* Controls */}
        <div className="rounded-2xl p-4 bg-zinc-900/70 border border-zinc-800 shadow-lg grid md:grid-cols-2 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Label>Height</Label>
            <Select value={H} onChange={(v)=> setH(v)} options={[2,3,4,5,6]} />

            <Label>Cap policy</Label>
            <NativeSelect value={capPolicy} setValue={setCapPolicy} options={["evict","strict","none"]} />

            <div className="flex items-center gap-3 ml-auto">
              <Label>K</Label>
              <input type="range" min={2} max={16} step={1} value={K} onChange={(e) => setK(parseInt(e.target.value))} />
              <span className="font-mono text-sm">{K}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Label>Weights</Label>
            <NumberInput label="α (space)" value={alpha} setValue={setAlpha} />
            <NumberInput label="β (moves)" value={beta} setValue={setBeta} />
            <NumberInput label="γ (recompute)" value={gamma} setValue={setGamma} />
            <div className="flex items-center gap-2 ml-auto">
              <Label>Preset</Label>
              <NativeSelect value={preset} setValue={(v)=> applyPreset(v as PresetKey)} options={["balanced","gpu_training","external_sort","zk_proving","embedded_edge","throughput_server"] as any} />
            </div>
            <div className="text-xs opacity-70 basis-full">cost = α·peak + β·flux + γ·recompute — {PRESETS[preset].blurb}</div>
          </div>
        </div>

        {/* Single panel */}
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-2xl p-3 bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Label>Schedule</Label>
              <NativeSelect value={scheduleKey} setValue={setScheduleKey} options={["reversible","baseline","partial"]} />
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setRunning((r) => !r)} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow">{running ? "Pause" : "Play"}</button>
                <button onClick={() => setStepIdx((s)=>Math.min(s+1, activeSchedule.length))} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow">Step</button>
                <button onClick={() => setStepIdx(0)} className="px-3 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 shadow">Reset</button>
              </div>
            </div>
            <NodeCanvas
              title={`${scheduleKey.toUpperCase()} (H=${H}, K=${K})`}
              nodes={nodes}
              edges={edges}
              childrenMap={childrenMap}
              currentStep={activeSchedule[Math.min(stepIdx, activeSchedule.length-1)]}
              pebbled={Psingle}
              computed={Csingle}
              speedMs={800}
            />
          </div>

          <div className="rounded-2xl p-4 bg-zinc-900/70 border border-zinc-800 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Peak" value={singleMetrics.peak} />
              <Metric label="Flux" value={singleMetrics.flux} />
              <Metric label="Recompute" value={singleMetrics.recomputeCount} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Children OK" value={singleMetrics.childrenOK ? "✅" : "❌"} />
              <Metric label="Cap respected" value={singleMetrics.capOK ? "✅" : "❌"} />
              <Metric label="Root" value={singleMetrics.rootComputed ? "✔" : "…"} />
            </div>
            <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-3">
              <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Your cost</div>
              <div className="text-2xl font-semibold">{singleCost.toFixed(2)}</div>
            </div>

            {/* Winner across all schedules */}
            <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-3">
              <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Winner (by your weights)</div>
              <div className="text-lg font-semibold">
                {leaderboard.winner.toUpperCase()}
              </div>
              <div className="text-xs opacity-70 mt-1 font-mono">
                R:{C_rev.toFixed(2)} • P:{C_part.toFixed(2)} • B:{C_base.toFixed(2)}
              </div>
            </div>

            <ExplainBlock />
            <TestsPanel tests={tests} />
          </div>
        </div>

        {/* Compare panel */}
        <div className="rounded-2xl p-4 bg-zinc-900/70 border border-zinc-800">
          <ComparePanel nodes={nodes} edges={edges} K={K} schedules={schedules} />
        </div>

      </div>
    </div>
  );
}

// -------------------- Canvas & UI Bits --------------------
function NodeCanvas({
  title,
  nodes,
  edges,
  childrenMap,
  currentStep,
  pebbled,
  computed,
  speedMs,
}: {
  title: string;
  nodes: NodeT[];
  edges: EdgeT[];
  childrenMap: Map<number, number[]>;
  currentStep?: Step;
  pebbled: Set<number>;
  computed: Set<number>;
  speedMs: number;
}) {
  const [zoom, setZoom] = useState(1);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ width: 800, height: 420 });

  useEffect(() => {
    function measure() {
      if (!frameRef.current) return;
      const r = frameRef.current.getBoundingClientRect();
      setView({ width: Math.max(300, r.width), height: Math.max(220, r.height) });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const bounds = useMemo(() => {
    const minX = Math.min(...nodes.map(n=>n.x));
    const maxX = Math.max(...nodes.map(n=>n.x));
    const minY = Math.min(...nodes.map(n=>n.y));
    const maxY = Math.max(...nodes.map(n=>n.y));
    return { minX, maxX, minY, maxY, w: maxX-minX+80, h: maxY-minY+80 };
  }, [nodes]);

  const fit = () => {
    const s = Math.min(view.width / bounds.w, view.height / bounds.h) * 0.95;
    setZoom(Number.isFinite(s) ? Math.max(0.2, Math.min(3, s)) : 1);
  };

  useEffect(() => { fit(); }, [view.width, view.height, bounds.w, bounds.h]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="text-sm opacity-80 font-medium">{title}</div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setZoom((z)=> Math.min(3, z*1.15))} className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">＋</button>
          <button onClick={() => setZoom((z)=> Math.max(0.2, z/1.15))} className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">－</button>
          <button onClick={fit} className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">Fit</button>
          <span className="text-xs opacity-70 font-mono">{(zoom*100).toFixed(0)}%</span>
        </div>
      </div>
      <div ref={frameRef} className="relative h-[420px] rounded-2xl overflow-auto bg-zinc-950/50 border border-zinc-800">
        <div style={{ width: bounds.w, height: bounds.h, transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
          <svg viewBox={`${bounds.minX-40} ${bounds.minY-40} ${bounds.w} ${bounds.h}`} width={bounds.w} height={bounds.h}>
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const active = currentStep?.type === "compute" && currentStep?.node === e.from;
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? "#a78bfa" : "#52525b"} strokeWidth={active ? 4 : 2} strokeOpacity={active ? 0.95 : 0.7} />
              );
            })}

            {/* nodes */}
            {nodes.map((n) => {
              const isTarget = currentStep?.type === "compute" && currentStep.node === n.id;
              return (
                <g key={n.id}>
                  {isTarget && (
                    <circle cx={n.x} cy={n.y} r={26} fill="none" stroke="#a78bfa" strokeWidth={2} strokeOpacity={0.6}>
                      <animate attributeName="r" from="22" to="30" dur="0.45s" repeatCount="1" fill="freeze" />
                      <animate attributeName="stroke-opacity" from="0.8" to="0.0" dur="0.45s" repeatCount="1" fill="freeze" />
                    </circle>
                  )}
                  <circle cx={n.x} cy={n.y} r={18} fill={pebbled.has(n.id)?"#34d399":(computed.has(n.id)?"#818cf8":"#3f3f46")} stroke="#e4e4e7" strokeWidth={1.5} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fafafa" fontSize="12" fontWeight={500}>{n.id}</text>
                </g>
              );
            })}

            {/* flow dots on compute: children → parent */}
            {currentStep?.type === "compute" && (childrenMap.get(currentStep.node) || []).map((cid, idx) => {
              const c = nodes.find((n) => n.id === cid)!;
              const p = nodes.find((n) => n.id === currentStep.node)!;
              return <TransferDot key={idx} from={c} to={p} speedMs={Math.max(300, Math.min(1200, speedMs))} />;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function ComparePanel({ nodes, edges, K, schedules }: { nodes: NodeT[]; edges: EdgeT[]; K: number; schedules: Record<ScheduleKey, Step[]> }) {
  const rv = useMemo(() => simulateSchedule(schedules.reversible, nodes, edges, Math.max(2, K), "evict"), [nodes, edges, K, schedules]);
  const bl = useMemo(() => simulateSchedule(schedules.baseline, nodes, edges, 99, "none"), [nodes, edges, schedules]);
  const pt = useMemo(() => simulateSchedule(schedules.partial, nodes, edges, Math.max(2, K), "evict"), [nodes, edges, K, schedules]);
  return (
    <div>
      <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Quick Compare (control vs variants)</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs opacity-70">
            <tr>
              <th className="text-left">Metric</th>
              <th className="text-left">Baseline (no cap)</th>
              <th className="text-left">Partial (K={K})</th>
              <th className="text-left">Reversible (K={K})</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Peak pebbles</td><td className="font-mono">{bl.peak}</td><td className="font-mono">{pt.peak}</td><td className="font-mono">{rv.peak}</td></tr>
            <tr><td>Flux (moves)</td><td className="font-mono">{schedules.baseline.length}</td><td className="font-mono">{schedules.partial.length}</td><td className="font-mono">{schedules.reversible.length}</td></tr>
            <tr><td>Recomputes</td><td className="font-mono">{bl.recomputeCount}</td><td className="font-mono">{pt.recomputeCount}</td><td className="font-mono">{rv.recomputeCount}</td></tr>
            <tr><td>Children OK at compute</td><td>{bl.childrenOK ? "✅" : "❌"}</td><td>{pt.childrenOK ? "✅" : "❌"}</td><td>{rv.childrenOK ? "✅" : "❌"}</td></tr>
            <tr><td>Root computed</td><td>{bl.rootComputed ? "✅" : "❌"}</td><td>{pt.rootComputed ? "✅" : "❌"}</td><td>{rv.rootComputed ? "✅" : "❌"}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="text-xs opacity-70 mt-2">
        <p><strong>Reading this:</strong> Reversible should reduce peak relative to Baseline; Partial sits between. Flux often grows as you clean more, showing the classic space↔time trade.</p>
      </div>
    </div>
  );
}

// -------------------- Explainers & UI helpers --------------------
function ExplainBlock() {
  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-3 text-sm leading-relaxed space-y-2">
      <p><strong>ELI5:</strong> You only have a few clips (K). To stand on a branch, both child branches need clips and you place one on the parent while you compute. With cleanup (reversible), you take clips back to reuse them—lower peak clips, more steps.</p>
      <p><strong>Why care?</strong> Many workloads (sorts, Merkle trees, checkpointing) trade space for time. Reversible schedules cut <em>peak space</em> at the cost of more <em>moves</em>. Use α/β/γ to reflect your costs.</p>
    </div>
  );
}

function TestsPanel({ tests }: { tests: { name: string; pass: boolean; detail: string }[] }) {
  return (
    <div className="mt-2 rounded-xl bg-zinc-800/50 border border-zinc-700 p-3">
      <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Self-tests (live)</div>
      <ul className="text-sm space-y-1">
        {tests.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden>{t.pass ? "✅" : "❌"}</span>
            <span>{t.name}</span>
            <span className="ml-auto opacity-70 font-mono text-xs">{t.detail}</span>
          </li>
        ))}
      </ul>
      <div className="text-xs opacity-70 mt-2">
        <p><strong>Tip:</strong> If “Children pebbled…” is ❌, try K≥3 or Cap=none.</p>
      </div>
    </div>
  );
}

function TransferDot({ from, to, speedMs }: { from: {x:number;y:number}; to:{x:number;y:number}; speedMs:number }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    setP(0);
    const t = setTimeout(() => setP(1), 10);
    const done = setTimeout(() => setP(1), speedMs);
    return () => { clearTimeout(t); clearTimeout(done); };
  }, [from.x, from.y, to.x, to.y, speedMs]);
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  return <circle cx={x} cy={y} r={4} fill="#fafafa" style={{ transition: `all ${speedMs}ms linear` }} opacity={0.9} />;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm opacity-80">{children}</span>;
}

function Select({ value, onChange, options }: { value: number; onChange: (v:number)=>void; options: number[] }) {
  return (
    <select className="bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700" value={value} onChange={(e)=> onChange(parseInt(e.target.value))}>
      {options.map((o)=> <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function NativeSelect<T extends string>({ value, setValue, options }: { value: T; setValue: (v:T)=>void; options: T[] }) {
  return (
    <select className="bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700" value={value} onChange={(e)=> setValue(e.target.value as T)}>
      {options.map((o)=> <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function NumberInput({ label, value, setValue }: { label:string; value:number; setValue:(v:number)=>void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="opacity-80">{label}</span>
      <input type="number" value={value} onChange={(e)=> setValue(parseFloat(e.target.value))} className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1" step="0.1" />
    </label>
  );
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub ? <div className="text-[11px] opacity-60">{sub}</div> : null}
    </div>
  );
}
