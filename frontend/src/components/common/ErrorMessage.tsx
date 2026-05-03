type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}
