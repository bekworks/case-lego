import { Link } from "@tanstack/react-router";

export const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-4">
      <h1 className="text-2xl font-black text-ink">Page not found</h1>
      <p className="text-sm text-muted">There is nothing at this address.</p>
      <Link to="/overview" className="text-sm font-bold text-primary">
        Go to the overview
      </Link>
    </div>
  );
};
