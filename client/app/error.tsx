// app/[your-route]/error.tsx
"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <h2>Something went wrong</h2>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
