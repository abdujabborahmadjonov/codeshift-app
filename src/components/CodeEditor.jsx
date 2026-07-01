import { useRef } from "react";

export function CodeEditor({ value, onChange, readOnly, placeholder, fontSize = 12 }) {
  const taRef = useRef(null);
  const lnRef = useRef(null);
  const lines = (value || "").split("\n").length;
  const lineHeight = Math.round(fontSize * 1.67);

  const sync = () => {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop;
  };

  const handleKeyDown = (e) => {
    if (readOnly || e.key !== "Tab") return;
    e.preventDefault();
    const ta = taRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    onChange?.(`${value.slice(0, start)}  ${value.slice(end)}`);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + 2;
    });
  };

  const style = {
    "--editor-font-size": `${fontSize}px`,
    "--editor-line-height": `${lineHeight}px`,
  };

  return (
    <div className="code-editor" style={style}>
      <div ref={lnRef} className="code-editor-gutter">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="code-editor-gutter-line">{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={taRef}
        className="code-editor-input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={sync}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={placeholder || ""}
      />
    </div>
  );
}
