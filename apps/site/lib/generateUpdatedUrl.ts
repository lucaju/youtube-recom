import type { Route } from 'next';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export function generateUpdatedURL(
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  paramsToUpdate: Record<string, string | undefined>,
) {
  const updatedParams = new URLSearchParams(searchParams.toString());

  for (const key in paramsToUpdate) {
    const value = paramsToUpdate[key];
    if (!value) {
      updatedParams.delete(key);
      continue;
    }
    updatedParams.set(key, value);
    updatedParams.delete;
  }

  return `${pathname}?${updatedParams.toString()}` as Route;
}
