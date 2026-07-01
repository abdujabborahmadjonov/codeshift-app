import { useState, useEffect } from "react";
import { Icon } from "./Icon.jsx";
import { decodeGitHubContent } from "../lib/api.js";

export function GitHubModal({ onClose, onImport }) {
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repoFiles, setRepoFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parseGitHubUrl = (u) => {
    const m = u.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
    if (m) return { owner: m[1], repo: m[2], branch: m[3], path: m[4], type: "file" };
    const r = u.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (r) {
      const t = u.match(/tree\/([^/]+)\/(.*)/);
      return { owner: r[1], repo: r[2], branch: t ? t[1] : "main", path: t ? t[2] : "", type: "repo" };
    }
    return null;
  };

  const fetchFile = async (owner, repo, branch, path) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    if (!res.ok) throw new Error("Could not fetch file — check the URL and repo visibility");
    const data = await res.json();
    if (Array.isArray(data)) return { type: "dir", files: data };
    return { type: "file", content: decodeGitHubContent(data.content), name: data.name };
  };

  const handleFetch = async () => {
    setLoading(true); setError(null); setRepoFiles(null); setSelectedFile(null);
    try {
      const parsed = parseGitHubUrl(url.trim());
      if (!parsed) throw new Error("Invalid GitHub URL. Use: github.com/user/repo/blob/branch/file.js");
      if (parsed.type === "file") {
        const r = await fetchFile(parsed.owner, parsed.repo, parsed.branch, parsed.path);
        if (r.type === "file") { onImport(r.content, r.name); onClose(); }
      } else {
        const r = await fetchFile(parsed.owner, parsed.repo, parsed.branch, parsed.path);
        if (r.type === "dir") {
          const codeFiles = r.files.filter((f) => f.type === "file" && /\.(js|jsx|ts|tsx|py|java|mjs|cjs)$/i.test(f.name));
          if (codeFiles.length === 0) throw new Error("No supported code files found in this directory");
          setRepoFiles({ files: codeFiles, owner: parsed.owner, repo: parsed.repo, branch: parsed.branch });
        }
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleSelectFile = async (file) => {
    setLoading(true); setSelectedFile(file.name);
    try {
      const r = await fetchFile(repoFiles.owner, repoFiles.repo, repoFiles.branch, file.path);
      if (r.type === "file") { onImport(r.content, r.name); onClose(); }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const filtered = repoFiles?.files.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Icon name="github" size={20} color="var(--text-secondary)" />
            Import from GitHub
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-input-row">
            <input
              className="modal-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="github.com/user/repo/blob/main/file.js"
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleFetch} disabled={loading || !url.trim()}>
              {loading ? "Fetching…" : "Fetch"}
            </button>
          </div>
          {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
          {repoFiles && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                    <Icon name="search" size={14} color="var(--text-faint)" />
                  </span>
                  <input
                    className="modal-input"
                    style={{ paddingLeft: 32 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter files…"
                  />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                {filtered.length} code file{filtered.length !== 1 ? "s" : ""} — click to import
              </div>
              <div className="file-list">
                {filtered.map((f) => (
                  <button
                    key={f.path}
                    className={`file-item${selectedFile === f.name ? " selected" : ""}`}
                    onClick={() => handleSelectFile(f)}
                    disabled={loading && selectedFile === f.name}
                  >
                    <Icon name="file" size={14} color="var(--text-muted)" />
                    {f.name}
                    <span className="file-size">{(f.size / 1024).toFixed(1)}kb</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="modal-hint">Supports direct file URLs or directory URLs. Public repos only.</p>
        </div>
      </div>
    </div>
  );
}
