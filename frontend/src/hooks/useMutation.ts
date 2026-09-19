import { useState } from 'react';

export function useMutation() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const run = async (operation: () => Promise<void>) => {
    if (pending) return false;
    try {
      setPending(true);
      setError('');
      await operation();
      return true;
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'The change could not be saved.');
      return false;
    } finally {
      setPending(false);
    }
  };

  return { error, pending, run, setError };
}
