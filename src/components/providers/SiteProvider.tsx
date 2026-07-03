"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Suscripcion } from "@/lib/types";
import { estaAlCorriente } from "@/lib/types";

export type ModalView = "login" | "signup" | "account" | "comprobante" | null;

interface SiteContextValue {
  user: User | null;
  profile: Profile | null;
  suscripciones: Suscripcion[];
  loading: boolean;
  alCorriente: boolean;
  modalView: ModalView;
  openModal: (view?: ModalView) => void;
  closeModal: () => void;
  refresh: () => Promise<void>;
  requireAuth: () => boolean;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalView, setModalView] = useState<ModalView>(null);

  const loadProfile = useCallback(
    async (uid: string) => {
      const [{ data: prof }, { data: subs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("suscripciones").select("*").eq("usuario_id", uid),
      ]);
      setProfile(prof ?? null);
      setSuscripciones(subs ?? []);
    },
    [supabase]
  );

  const refresh = useCallback(async () => {
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    setUser(current);
    if (current) await loadProfile(current.id);
    else {
      setProfile(null);
      setSuscripciones([]);
    }
  }, [supabase, loadProfile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
      if (mounted) setLoading(false);
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      else {
        setProfile(null);
        setSuscripciones([]);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = useCallback(
    (view: ModalView = null) => {
      setModalView(view ?? (user ? "account" : "login"));
    },
    [user]
  );

  const closeModal = useCallback(() => setModalView(null), []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setModalView("login");
    return false;
  }, [user]);

  const alCorriente = profile ? estaAlCorriente(profile, suscripciones) : false;

  const value: SiteContextValue = {
    user,
    profile,
    suscripciones,
    loading,
    alCorriente,
    modalView,
    openModal,
    closeModal,
    refresh,
    requireAuth,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite debe usarse dentro de <SiteProvider>");
  return ctx;
}
