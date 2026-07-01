import { useState, useRef, useEffect, useCallback } from "react";
import { Icon, Toast } from "../components/Icon.jsx";
import { CodeEditor } from "../components/CodeEditor.jsx";
import { DiffView } from "../components/DiffView.jsx";
import { GitHubModal } from "../components/GitHubModal.jsx";
import { MIGRATION_PATHS, SAMPLES, PROMPTS, getPath } from "../constants.js";
import { callChat, stripCodeFences, getOutputFilename, navigateTo } from "../lib/api.js";
import { loadHistory, saveMigration, deleteMigration, clearHistory } from "../lib/history.js";

const STEPS = ["Migrating", "Analyzing", "Done"];

function confidenceColor(n) {
  if (n >= 85) return "var(--success)";
  if (n >= 60) return "var(--warning)";
  return "var(--danger)";
}

function HistoryDrawer({ open, onClose, onRestore, onDelete }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) setItems(loadHistory());
  }, [open]);

  if (!open) return null;

  const fmt = (ts) => {
    const d = new Date(ts);
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="history-drawer">
        <div className="drawer-header">
          <span className="drawer-title">Migration History</span>
          <div style={{ display: "flex", gap: 6 }}>
            {items.length > 0 && (
              <button className="btn-sm btn-secondary btn" onClick={() => { clearHistory(); setItems([]); }}>
                Clear all
              </button>
            )}
            <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="history-empty">No migrations yet.<br />Your history will appear here.</div>
          ) : (
            items.map((item) => {
              const p = getPath(item.pathId);
              return (
                <div key={item.id} className="history-item" onClick={() => onRestore(item)}>
                  <div className="history-item-top">
                    <span className="history-path" style={{ color: p?.color }}>
                      {p ? `${p.from} → ${p.to}` : item.pathId}
                    </span>
                    <span className="history-time">{fmt(item.timestamp)}</span>
                  </div>
                  <div className="history-preview">{item.sourcePreview}</div>
                  <div className="history-actions">
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onRestore(item); }}>
                      Restore
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onDelete(item.id); setItems(loadHistory()); }}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export function MigrationApp({ onBack, initialPath = "js-ts" }) {
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [path, setPath] = useState(initialPath);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [analysis, setAnalysis] = useState(null);
  const [view, setView] = useState("output");
  const [error, setError] = useState(null);
  const [time, setTime] = useState(null);
  const [toast, setToast] = useState(null);
  const [showGH, setShowGH] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [importedName, setImportedName] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const abortRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = "default") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (MIGRATION_PATHS.some((p) => p.id === initialPath)) setPath(initialPath);
  }, [initialPath]);

  useEffect(() => {
    setSource(SAMPLES[path] || "");
    setOutput("");
    setAnalysis(null);
    setError(null);
    setTime(null);
    setShowPanel(false);
    setImportedName(null);
  }, [path]);

  const handleFile = useCallback((file) => {
    if (!file || !/\.(js|jsx|ts|tsx|py|java|mjs|cjs)$/i.test(file.name)) {
      setError("Unsupported file type. Use .js, .jsx, .ts, .tsx, .py, .java, .mjs, or .cjs");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSource(e.target.result);
      setImportedName(file.name);
      setOutput("");
      setAnalysis(null);
      setError(null);
      showToast(`Imported ${file.name}`, "success");
    };
    reader.readAsText(file);
  }, []);

  const migrate = useCallback(async () => {
    if (!source.trim() || loading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setStep(0);
    setError(null);
    setOutput("");
    setAnalysis(null);
    setShowPanel(false);
    const t0 = Date.now();

    try {
      const raw = await callChat(
        [{ role: "system", content: PROMPTS[path] }, { role: "user", content: source }],
        { signal: controller.signal }
      );
      const code = stripCodeFences(raw);
      setOutput(code);
      setStep(1);

      const analysisRaw = await callChat(
        [
          {
            role: "system",
            content: `Analyze this code migration. Return ONLY valid JSON, no markdown: {"changes":[{"type":"added|modified|removed","description":"..."}],"warnings":["..."],"confidence":0-100}. Max 6 changes.`,
          },
          { role: "user", content: `From:\n${source.slice(0, 2000)}\n\nTo:\n${code.slice(0, 2000)}` },
        ],
        { max_tokens: 800, signal: controller.signal }
      );

      const parsed = JSON.parse(stripCodeFences(analysisRaw));
      setAnalysis(parsed);
      setShowPanel(true);
      setStep(2);
      setTime(((Date.now() - t0) / 1000).toFixed(1));

      saveMigration({
        pathId: path,
        sourcePreview: source.split("\n")[0].slice(0, 60),
        source,
        output: code,
        analysis: parsed,
        importedName,
      });
      showToast("Migration complete", "success");
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
      setStep(-1);
      abortRef.current = null;
    }
  }, [source, path, loading, importedName]);

  const cancelMigration = () => {
    abortRef.current?.abort();
    setLoading(false);
    setStep(-1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); migrate(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [migrate]);

  const handlePathChange = (pathId) => {
    setPath(pathId);
    navigateTo("app", pathId);
  };

  const restoreHistory = (item) => {
    setPath(item.pathId);
    navigateTo("app", item.pathId);
    setSource(item.source);
    setOutput(item.output || "");
    setAnalysis(item.analysis || null);
    setShowPanel(!!item.analysis);
    setImportedName(item.importedName || null);
    setShowHistory(false);
    showToast("Restored from history", "success");
  };

  const useOutputAsSource = () => {
    setSource(output);
    setImportedName(importedName ? `migrated-${importedName}` : null);
    setOutput("");
    setAnalysis(null);
    setShowPanel(false);
    showToast("Output moved to source — ready for next migration", "success");
  };

  const cp = getPath(path);

  return (
    <div className="app-shell">
      {showGH && (
        <GitHubModal
          onClose={() => setShowGH(false)}
          onImport={(code, name) => {
            setSource(code);
            setImportedName(name);
            setOutput("");
            setAnalysis(null);
            showToast(`Imported ${name}`, "success");
          }}
        />
      )}
      <HistoryDrawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={restoreHistory}
        onDelete={deleteMigration}
      />
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="app-bar">
        <button className="btn-sm btn-secondary btn" onClick={onBack}>← Home</button>
        <div className="app-bar-divider" />
        <div className="nav-brand">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 11 }}>⇄</div>
          <span className="logo-text" style={{ fontSize: 14 }}>CodeShift</span>
        </div>
        {cp && (
          <span style={{
            padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: `${cp.color}15`, color: cp.color, border: `1px solid ${cp.color}30`,
          }}>
            {cp.from} → {cp.to}
          </span>
        )}
        <div className="app-bar-spacer" />
        <button className="btn btn-sm btn-secondary" onClick={() => setShowHistory(true)}>
          <Icon name="history" size={14} /> History
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => setShowGH(true)}>
          <Icon name="github" size={14} /> GitHub
        </button>
      </div>

      <div className="path-tabs">
        {MIGRATION_PATHS.map((p) => (
          <button
            key={p.id}
            className={`path-tab${path === p.id ? " active" : ""}`}
            style={{ "--tab-color": p.color }}
            onClick={() => handlePathChange(p.id)}
          >
            <span className="path-tab-icon">{p.icon}</span>
            {p.from} → {p.to}
          </button>
        ))}
      </div>

      <div className="editor-row">
        <div
          className="editor-panel editor-panel-source"
          style={{ flex: showPanel ? "0 0 38%" : "0 0 50%" }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          {dragOver && <div className="drop-overlay">Drop file to import</div>}
          <input ref={fileInputRef} type="file" accept=".js,.jsx,.ts,.tsx,.py,.java,.mjs,.cjs" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="panel-dot panel-dot-orange" />
              <span className="panel-title">Source</span>
              {importedName && <span className="panel-filename">{importedName}</span>}
            </div>
            <div className="panel-header-right">
              <button className="btn btn-sm btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <Icon name="upload" size={12} /> Upload
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setSource(SAMPLES[path] || ""); setImportedName(null); setOutput(""); setAnalysis(null); }}>
                Sample
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setSource(""); setImportedName(null); setOutput(""); setAnalysis(null); }}>
                Clear
              </button>
              <span className="panel-meta">{source.split("\n").length} ln</span>
            </div>
          </div>
          <div className="panel-body">
            <CodeEditor value={source} onChange={setSource} placeholder="Paste your code here…" fontSize={fontSize} />
          </div>
        </div>

        <div className="editor-panel editor-panel-output" style={{ flex: showPanel ? "0 0 37%" : "0 0 50%" }}>
          <div className="panel-header">
            <div className="panel-header-left">
              <div className="view-tabs">
                {["output", "diff"].map((v) => (
                  <button key={v} className={`view-tab${view === v ? " active" : ""}`} onClick={() => setView(v)}>
                    {v === "output" ? "Output" : "Diff"}
                  </button>
                ))}
              </div>
              <span className={`panel-dot ${output ? "panel-dot-green" : "panel-dot-gray"}`} />
            </div>
            <div className="panel-header-right">
              {output && (
                <>
                  <button className="btn btn-sm btn-secondary" onClick={() => { navigator.clipboard.writeText(output); showToast("Copied to clipboard", "success"); }}>
                    <Icon name="copy" size={12} /> Copy
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => {
                    const b = new Blob([output], { type: "text/plain" });
                    const u = URL.createObjectURL(b);
                    const a = document.createElement("a");
                    a.href = u;
                    a.download = getOutputFilename(path, importedName);
                    a.click();
                    URL.revokeObjectURL(u);
                    showToast("File downloaded", "success");
                  }}>
                    <Icon name="download" size={12} /> Save
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={useOutputAsSource} title="Use output as new source for chained migrations">
                    <Icon name="refresh" size={12} /> Iterate
                  </button>
                </>
              )}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="btn btn-sm btn-secondary"
                style={{ padding: "3px 6px", cursor: "pointer" }}
              >
                {[11, 12, 13, 14, 16].map((s) => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
          </div>
          <div className="panel-body">
            {view === "output"
              ? <CodeEditor value={output} readOnly placeholder="Migrated code appears here…" fontSize={fontSize} />
              : <DiffView original={source} migrated={output} />}
          </div>
        </div>

        {showPanel && analysis && (
          <div className="analysis-panel">
            <div className="panel-header">
              <span className="panel-title">Analysis</span>
              <button className="btn-icon" onClick={() => setShowPanel(false)}><Icon name="x" size={14} /></button>
            </div>
            <div className="analysis-body">
              <div className="confidence-card">
                <div className="confidence-label">CONFIDENCE</div>
                <div className="confidence-value">
                  <span className="confidence-num" style={{ color: confidenceColor(analysis.confidence) }}>
                    {analysis.confidence}
                  </span>
                  <span className="confidence-max">/100</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${analysis.confidence}%`, background: confidenceColor(analysis.confidence) }} />
                </div>
                {time && <div className="confidence-time">Completed in {time}s</div>}
              </div>

              <div className="section-label">CHANGES</div>
              {analysis.changes?.map((c, i) => (
                <div key={i} className="change-item">
                  <span className={`change-tag change-tag-${c.type === "added" ? "add" : c.type === "removed" ? "del" : "mod"}`}>
                    {c.type === "added" ? "ADD" : c.type === "removed" ? "DEL" : "MOD"}
                  </span>
                  <span className="change-desc">{c.description}</span>
                </div>
              ))}

              {analysis.warnings?.length > 0 && (
                <>
                  <div className="section-label section-label-warn" style={{ marginTop: 14 }}>⚠ WARNINGS</div>
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="warning-item">{w}</div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="action-bar">
        {error && <div className="error-banner">{error}</div>}
        {loading && (
          <>
            <div className="progress-steps">
              {STEPS.map((s, i) => (
                <span key={s} className={`progress-step${step === i ? " active" : step > i ? " done" : ""}`}>
                  <span className="progress-step-dot" />{s}
                </span>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={cancelMigration}>Cancel</button>
          </>
        )}
        <button className="btn btn-primary" onClick={migrate} disabled={loading || !source.trim()}>
          {loading ? <><span className="spinner" /> Migrating…</> : <>Migrate {cp?.from} → {cp?.to}</>}
        </button>
        {!loading && <span className="kbd-hint">⌘ Enter</span>}
        {output && !showPanel && analysis && (
          <button className="btn btn-secondary" onClick={() => setShowPanel(true)}>Show Analysis</button>
        )}
      </div>
    </div>
  );
}
