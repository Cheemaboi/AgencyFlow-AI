type ModalPreviewProps = {
  title: string;
  description: string;
};

export function ModalPreview({ title, description }: ModalPreviewProps) {
  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border-subtle)] bg-white p-5 shadow-[0_28px_56px_rgba(16,24,40,0.12)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-hover)]">
        Modal style
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
          Cancel
        </button>
        <button className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white">
          Confirm
        </button>
      </div>
    </div>
  );
}
