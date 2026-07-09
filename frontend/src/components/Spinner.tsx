interface SpinnerProps {
  label?: string;
}

function Spinner({ label = "Carregando..." }: SpinnerProps) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <span className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}

export default Spinner;
