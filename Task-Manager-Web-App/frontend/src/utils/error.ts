export function getErrorMessage(err: unknown, fallback: string) {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as any).response?.data?.message === 'string'
  ) {
    return (err as any).response.data.message as string;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

