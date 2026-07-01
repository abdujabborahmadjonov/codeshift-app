import { useMemo } from "react";
import { computeLineDiff } from "../lib/diff.js";

const STYLES = {
  a: { cls: "diff-line-add", p: "+" },
  r: { cls: "diff-line-del", p: "-" },
  s: { cls: "diff-line-same", p: " " },
};

export function DiffView({ original, migrated }) {
  const { lines, stats } = useMemo(
    () => (original && migrated ? computeLineDiff(original, migrated) : { lines: [], stats: null }),
    [original, migrated]
  );

  if (!original || !migrated) {
    return (
      <div className="diff-view">
        <div className="diff-empty">
          <span>Run a migration to see the diff</span>
          <span style={{ fontSize: 11 }}>Changes appear line-by-line with +/− markers</span>
        </div>
      </div>
    );
  }

  return (
    <div className="diff-view">
      <div className="diff-stats">
        <span className="diff-stat-add">+{stats.added} added</span>
        <span className="diff-stat-del">−{stats.removed} removed</span>
        <span className="diff-stat-same">{stats.unchanged} unchanged</span>
      </div>
      {lines.map((d, i) => (
        <div key={i} className={`diff-line ${STYLES[d.t].cls}`}>
          <span className="diff-line-num">{d.ln}</span>
          <span className="diff-line-prefix">{STYLES[d.t].p}</span>
          <span>{d.l}</span>
        </div>
      ))}
    </div>
  );
}
