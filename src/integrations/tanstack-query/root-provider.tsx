import { QueryClient } from "@tanstack/react-query";

export const getContext = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  });

  return {
    queryClient,
  };
};
export default function TanstackQueryProvider() {}
