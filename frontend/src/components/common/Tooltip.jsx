/* ==========================================================================
   Tooltip.jsx
   Place at: src/components/Tooltip.jsx

   Usage — wrap any element:
      <Tooltip content="Delete this item">
        <button className="btn btn-outline btn-icon"><Trash2 size={16} /></button>
      </Tooltip>
   ========================================================================== */

import { useState } from "react";

export function Tooltip({ content, side = "top", children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && <span className={`tooltip tooltip-${side}`} role="tooltip">{content}</span>}
    </span>
  );
}