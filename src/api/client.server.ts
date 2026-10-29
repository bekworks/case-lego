export const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${process.env.API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${path}`);
  }
  return (await response.json()) as T;
};
