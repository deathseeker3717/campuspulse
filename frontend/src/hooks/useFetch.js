import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function whenever `deps` change and tracks loading / error state.
// Returns { data, loading, error, reload, setData }.
export default function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const counter = useRef(0); // ignore responses from outdated requests

  const run = useCallback(() => {
    const id = ++counter.current;
    setLoading(true);
    setError(null);
    return fn()
      .then((res) => {
        if (id === counter.current) setData(res);
      })
      .catch((err) => {
        if (id === counter.current) setError(err.message || 'Something went wrong');
      })
      .finally(() => {
        if (id === counter.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
