const STORAGE_KEY = "codeshift_history";
const MAX_ITEMS = 20;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMigration(entry) {
  const history = loadHistory();
  const item = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...entry,
  };
  const next = [item, ...history.filter((h) => h.id !== item.id)].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return item;
}

export function deleteMigration(id) {
  const next = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
