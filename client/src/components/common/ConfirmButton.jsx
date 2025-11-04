export default function ConfirmButton({
  confirmText = "Are you sure?",
  onConfirm,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      onClick={() => {
        if (window.confirm(confirmText)) onConfirm?.();
      }}
    >
      {children}
    </button>
  );
}
