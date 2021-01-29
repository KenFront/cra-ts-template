import { useEffect } from 'react';

function useHashChange(onHashChange: (this: Window, ev: HashChangeEvent) => void) {
  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [onHashChange]);
}
export default useHashChange;
