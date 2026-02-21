import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { useProfileQuery } from "@/graphql/generated/schema";
import { authClient } from "@/lib/authClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000";

async function ensureSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth-ensure-session`, {
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Profile() {
  const router = useRouter();
  const { data, loading } = useProfileQuery({ fetchPolicy: "cache-and-network" });
  const user = data?.me ?? null;

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // useListPasskeys fires immediately on mount (before ensure-session).
  // For email/password users the first request may get 401 (no session cookie
  // yet). Once ensure-session succeeds we call refetch() to reload the list.
  const { data: passkeys, isPending: passkeysLoading, refetch: refetchPasskeys } =
    authClient.useListPasskeys();

  // Ensure a better-auth session exists as soon as the user is known, then
  // refetch the passkey list so it reflects the now-valid session.
  const sessionEnsuredRef = useRef(false);

  useEffect(() => {
    if (!user || sessionEnsuredRef.current) return;
    sessionEnsuredRef.current = true;
    ensureSession().then((ok) => {
      if (ok) (refetchPasskeys as (() => void) | undefined)?.();
    });
  }, [user, refetchPasskeys]);

  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setAddError(null);
    setAddLoading(true);
    try {
      // Re-ensure session in case the cookie expired since page load.
      const ok = await ensureSession();
      if (!ok) {
        setAddError("Session expirée, veuillez vous reconnecter.");
        return;
      }

      const result = await authClient.passkey.addPasskey({
        name: `Passkey ${new Date().toLocaleDateString("fr-FR")}`,
      });
      if (result?.error) {
        setAddError(result.error.message ?? "Erreur lors de l'enregistrement de la clé d'accès");
      } else {
        (refetchPasskeys as (() => void) | undefined)?.();
      }
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    setDeleteLoading(passkeyId);
    try {
      const ok = await ensureSession();
      if (!ok) return;

      await authClient.passkey.deletePasskey({ id: passkeyId });
      (refetchPasskeys as (() => void) | undefined)?.();
    } catch (err) {
      console.error("Error deleting passkey:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading || !user) {
    return (
      <Layout pageTitle="Profil">
        <div className="p-4 text-center">Chargement...</div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Profil">
      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-xl font-bold my-6">Mon profil</h2>

        <div className="card bg-base-100 shadow-sm border border-gray-200 mb-6">
          <div className="card-body">
            <h3 className="card-title text-base">Informations du compte</h3>
            <p className="text-gray-600">
              <span className="font-medium">Email :</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Rôle :</span> {user.role}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-gray-200">
          <div className="card-body">
            <h3 className="card-title text-base">Clés d'accès (Passkeys)</h3>
            <p className="text-sm text-gray-500 mb-4">
              Les clés d'accès vous permettent de vous connecter sans mot de passe via votre
              empreinte digitale, Face ID ou votre clé de sécurité.
            </p>

            {addError && (
              <div className="alert alert-error mb-4 text-sm">
                <span>{addError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddPasskey}
              disabled={addLoading}
              className="btn btn-primary btn-sm w-fit mb-4"
            >
              {addLoading ? "Enregistrement..." : "Ajouter une clé d'accès"}
            </button>

            {passkeysLoading ? (
              <p className="text-sm text-gray-400">Chargement des clés d'accès...</p>
            ) : passkeys && passkeys.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {passkeys.map((pk) => (
                  <li
                    key={pk.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-sm">{pk.name ?? "Clé d'accès"}</p>
                      {pk.createdAt && (
                        <p className="text-xs text-gray-400">
                          Ajoutée le{" "}
                          {new Date(pk.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePasskey(pk.id)}
                      disabled={deleteLoading === pk.id}
                      className="btn btn-outline btn-error btn-xs"
                    >
                      {deleteLoading === pk.id ? "..." : "Supprimer"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Aucune clé d'accès enregistrée.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
