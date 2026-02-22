import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  // Guard against React StrictMode double-invocation: a token must only be
  // consumed once. Without this, the second call would see user_not_found
  // because the first call already updated the email in the DB.
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const token = router.query.token as string | undefined;
    // callbackURL is passed by some flows (e.g. change-email step-2 carries %2F).
    // We read it here so we can redirect properly after success.
    const callbackURL = router.query.callbackURL as string | undefined;

    if (!token) {
      setStatus("error");
      setErrorMessage("Lien de vérification invalide ou manquant.");
      return;
    }

    authClient
      .verifyEmail({ query: { token } })
      .then(async (result) => {
        if (result.error) {
          setStatus("error");
          setErrorMessage(
            result.error.message ?? "Le lien de vérification est invalide ou a expiré.",
          );
        } else {
          // better-auth created a session — call the bridge to mint our JWT cookie
          try {
            await fetch(`${BACKEND_URL}/api/auth-bridge`, {
              credentials: "include",
            });
          } catch {
            // bridge failure is non-fatal; user can still log in manually
          }
          setStatus("success");
          // Redirect to profile. The ?emailChanged=1 param causes profile.tsx
          // to re-mint the JWT and refetch so the new email appears immediately.
          // This is harmless for other flows (signup verify, etc.).
          const destination = callbackURL && callbackURL !== "/"
            ? callbackURL
            : "/profile?emailChanged=1";
          router.replace(destination);
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Une erreur est survenue lors de la vérification.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <Layout pageTitle="Vérification de l'email">
      <div className="p-4 max-w-[400px] mx-auto text-center mt-16">
        {status === "loading" && (
          <>
            <h2 className="text-xl font-bold mb-4">Vérification en cours...</h2>
            <span className="loading loading-spinner loading-lg" />
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-success">Email vérifié !</h2>
            <p className="mb-6 text-gray-600">
              Votre adresse email a bien été vérifiée. Redirection en cours...
            </p>
            <span className="loading loading-spinner loading-md" />
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-error">Vérification échouée</h2>
            <p className="mb-6 text-gray-600">{errorMessage}</p>
            <a href="/login" className="btn btn-outline">
              Retour à la connexion
            </a>
          </>
        )}
      </div>
    </Layout>
  );
}
