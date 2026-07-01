export function computeLineDiff(original, migrated) {
  const oL = original.split("\n");
  const mL = migrated.split("\n");
  const max = Math.max(oL.length, mL.length);
  const lines = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (let i = 0; i < max; i++) {
    const o = oL[i];
    const m = mL[i];
    if (o === undefined) {
      lines.push({ t: "a", l: m, ln: i + 1 });
      added++;
    } else if (m === undefined) {
      lines.push({ t: "r", l: o, ln: i + 1 });
      removed++;
    } else if (o !== m) {
      lines.push({ t: "r", l: o, ln: i + 1 });
      lines.push({ t: "a", l: m, ln: i + 1 });
      added++;
      removed++;
    } else {
      lines.push({ t: "s", l: o, ln: i + 1 });
      unchanged++;
    }
  }

  return { lines, stats: { added, removed, unchanged, changed: added + removed } };
}
