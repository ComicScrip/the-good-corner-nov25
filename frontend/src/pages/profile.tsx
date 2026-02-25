import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "@/components/Layout";
import { useProfileQuery } from "@/graphql/generated/schema";
import { authClient } from "@/lib/authClient";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

export default function Profile() {
  const router = useRouter();
  const { data, loading, refetch } = useProfileQuery({ fetchPolicy: "cache-and-network" });
  const user = data?.me ?? null;

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Refetch profile when landing back from an email-change confirmation redirect.
  useEffect(() => {
    if (!router.query.emailChanged) return;
    refetch();
    // Remove the query param without a full navigation
    router.replace("/profile", undefined, { shallow: true });
  }, [router.query.emailChanged, refetch, router]);

  const { data: passkeys, isPending: passkeysLoading, refetch: refetchPasskeys } =
    authClient.useListPasskeys();

  // ── Passkey handlers ─────────────────────────────────────────────────────
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await authClient.passkey.addPasskey({
        name: `Passkey ${new Date().toLocaleDateString("fr-FR")}`,
      });
      if (result?.error) {
        const msg = result.error.message
          ? `${result.error.message} (${result.error.code ?? result.error.status})`
          : `Erreur lors de l'enregistrement de la clé d'accès (${result.error.code ?? result.error.status})`;
        setAddError(msg);
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
      await authClient.passkey.deletePasskey({ id: passkeyId });
      (refetchPasskeys as (() => void) | undefined)?.();
    } catch (err) {
      console.error("Error deleting passkey:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // ── Change email ──────────────────────────────────────────────────────────
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmailForm,
    formState: { errors: emailErrors },
  } = useForm<{ newEmail: string }>();

  const handleChangeEmail = async ({ newEmail }: { newEmail: string }) => {
    setEmailChangeError(null);
    setEmailChangeLoading(true);
    try {
      const result = await authClient.changeEmail({
        newEmail,
        callbackURL: `${FRONTEND_URL}/profile?emailChanged=1`,
      });
      if (result.error) {
        setEmailChangeError(result.error.message ?? "Une erreur est survenue.");
      } else {
        setEmailFormOpen(false);
        setEmailPending(true);
        resetEmailForm();
      }
    } catch {
      setEmailChangeError("Une erreur est survenue lors de la demande.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-600 text-white flex items-center justify-center text-3xl font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="card bg-base-100 shadow-sm border border-gray-200 mb-6">
          <div className="card-body gap-3">
            <h3 className="card-title text-base">Informations du compte</h3>

            {/* Current email + verified badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-600">Email :</span>
              <span className="text-gray-800">{user.email}</span>
              {user.emailVerified ? (
                <span className="badge badge-success badge-sm">Vérifié</span>
              ) : (
                <span className="badge badge-warning badge-sm">Non vérifié</span>
              )}
              {!emailFormOpen && !emailPending && (
                <button
                  type="button"
                  onClick={() => { setEmailFormOpen(true); setEmailChangeError(null); }}
                  className="btn btn-ghost btn-xs text-blue-600 ml-auto"
                >
                  Modifier
                </button>
              )}
            </div>

            {/* Pending banner */}
            {emailPending && (
              <div className="alert alert-info text-sm py-2">
                <span>
                  En attente de confirmation — un email a été envoyé à{" "}
                  <strong>{user.email}</strong>. Cliquez sur le lien pour valider le changement.
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs ml-auto"
                  onClick={() => setEmailPending(false)}
                >
                  Fermer
                </button>
              </div>
            )}

            {/* Change email inline form */}
            {emailFormOpen && (
              <form
                onSubmit={handleSubmitEmail(handleChangeEmail)}
                className="flex flex-col gap-2 mt-1"
              >
                <input
                  type="email"
                  placeholder="Nouvelle adresse email"
                  className="input input-bordered input-sm w-full"
                  {...registerEmail("newEmail", {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "L'email n'est pas valide",
                    },
                    validate: (v) =>
                      v.toLowerCase() !== user.email.toLowerCase() ||
                      "C'est déjà votre adresse email actuelle",
                  })}
                />
                {emailErrors.newEmail && (
                  <p className="text-red-500 text-xs">{emailErrors.newEmail.message}</p>
                )}
                {emailChangeError && (
                  <p className="text-red-500 text-xs">{emailChangeError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={emailChangeLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {emailChangeLoading ? "Envoi..." : "Envoyer le lien de confirmation"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setEmailFormOpen(false); setEmailChangeError(null); resetEmailForm(); }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Passkeys */}
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
