import { useEffect, useState, useCallback } from 'react';
import { auth } from '../config/firebaseConfig';
import AuthService from '../services/authService';

type Role = 'patient' | 'doctor' | null;

export default function useUserProfile() {
  const [uid, setUid] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadForUid = useCallback(async (u: string) => {
    setLoading(true);
    setError(null);
    try {
      const roles = await AuthService.determineRoles(u);
      if (roles.error === 'permission-denied') {
        setError('permission-denied');
        setRole(null);
        setData(null);
        return;
      }

      const roleToUse: Role = roles.isPatient ? 'patient' : roles.isDoctor ? 'doctor' : null;
      setRole(roleToUse);

      if (!roleToUse) {
        setData(null);
        return;
      }

      const res = await AuthService.getUserData(u, roleToUse);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'failed');
        setData(null);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user && user.uid) {
        setUid(user.uid);
        loadForUid(user.uid);
      } else {
        setUid(null);
        setRole(null);
        setData(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [loadForUid]);

  const refresh = useCallback(async () => {
    if (!uid) return;
    await loadForUid(uid);
  }, [uid, loadForUid]);

  return { uid, role, data, loading, error, refresh } as const;
}
