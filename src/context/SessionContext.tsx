import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createApiClient, type ApiClient } from "../api/client";
import type { AccountMeResponse } from "../api/types";
import { getAccountWorkspace, loadSessionAccount } from "../lib/account";
import { getConfigErrorMessage, isConfigValid } from "../lib/config";
import { getSupabase } from "../lib/supabase";

export type AuthPhase =
  | "initializing"
  | "unauthenticated"
  | "loading_account"
  | "ready"
  | "account_error";

type SessionContextValue = {
  session: Session | null;
  account: AccountMeResponse | null;
  workspaceId: string | null;
  workspaceName: string | null;
  api: ApiClient;
  loading: boolean;
  accountLoading: boolean;
  authPhase: AuthPhase;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function hasValidWorkspace(account: AccountMeResponse | null) {
  return Boolean(getAccountWorkspace(account)?.id);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const workspaceIdRef = useRef<string | null>(null);

  const [api] = useState(() =>
    createApiClient({
      getToken: async () => sessionRef.current?.access_token ?? null,
      getWorkspaceId: () => workspaceIdRef.current,
    }),
  );

  const refreshAccount = useCallback(async () => {
    if (!session?.access_token) {
      setAccount(null);
      setAccountLoading(false);
      return;
    }

    setAccountLoading(true);

    try {
      const me = await loadSessionAccount(api);
      workspaceIdRef.current = getAccountWorkspace(me)?.id ?? null;
      setAccount(me);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load account";
      setAccount(null);
      setError(message);
    } finally {
      setAccountLoading(false);
    }
  }, [api, session?.access_token]);

  useEffect(() => {
    if (!isConfigValid()) {
      setError(getConfigErrorMessage());
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      sessionRef.current = data.session;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      sessionRef.current = nextSession;
      setSession(nextSession);
      if (!nextSession) {
        workspaceIdRef.current = null;
        setAccount(null);
        setError(null);
        setAccountLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setAccount(null);
      setAccountLoading(false);
      return;
    }

    void refreshAccount();
  }, [refreshAccount, session?.access_token]);

  const authPhase = useMemo<AuthPhase>(() => {
    if (loading) return "initializing";
    if (!session) return "unauthenticated";
    if (accountLoading) return "loading_account";
    if (!account && !error) return "loading_account";
    if (error || !account || !hasValidWorkspace(account)) return "account_error";
    return "ready";
  }, [account, accountLoading, error, loading, session]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      throw signInError;
    }
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    sessionRef.current = null;
    workspaceIdRef.current = null;
    setAccount(null);
    setError(null);
    setAccountLoading(false);
  }, []);

  const workspace = getAccountWorkspace(account);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      account,
      workspaceId: workspace?.id ?? null,
      workspaceName: workspace?.name ?? null,
      api,
      loading,
      accountLoading,
      authPhase,
      error,
      signIn,
      signOut,
      refreshAccount,
    }),
    [
      account,
      accountLoading,
      api,
      authPhase,
      error,
      loading,
      refreshAccount,
      session,
      signIn,
      signOut,
      workspace?.id,
      workspace?.name,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
