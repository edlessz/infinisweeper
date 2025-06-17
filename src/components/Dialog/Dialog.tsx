import { useEffect, useRef } from "react";
import "./Dialog.css";

interface DialogProps {
  title?: string;
  children?: React.ReactNode;
  visible?: boolean;
  className?: string;
}

export default function Dialog({
  title,
  children,
  visible,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const visibleToggled = useRef(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.classList.remove("visible", "hidden", "hidden-initial");
    void dialog.offsetWidth; // Force reflow

    const isInitial = visibleToggled.current < 2;
    const stateClass = visible
      ? "visible"
      : isInitial
        ? "hidden-initial"
        : "hidden";

    dialog.classList.add(stateClass);
    visibleToggled.current++;
  }, [visible]);

  return (
    <div ref={dialogRef} className={`Dialog ${className}`}>
      {title && <h2 className="Header">{title}</h2>}
      {children}
    </div>
  );
}
