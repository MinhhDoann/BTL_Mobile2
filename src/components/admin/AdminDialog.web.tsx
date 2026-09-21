import { PropsWithChildren, useEffect, useId, useRef } from 'react';

export function AdminDialog({ title, busy, onClose, children }: PropsWithChildren<{ title: string; busy: boolean; onClose: () => void }>) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={ref} className="admin-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
