import { useEffect, useState } from 'react';
import { demoStore } from '../../realtime/demoStore';
export function useLocalIdentity() {
  const [profile, setProfile] = useState(() => demoStore.getProfile());
  useEffect(() => {
    const update = () => setProfile(demoStore.getProfile());
    window.addEventListener('bluesteam:identity-updated', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('bluesteam:identity-updated', update); window.removeEventListener('storage', update); };
  }, []);
  return profile;
}
