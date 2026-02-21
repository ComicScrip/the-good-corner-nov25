import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000";

type Status = "loading" | "success" | "error";

export default function MagicLinkVerify() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token as string | undefined;

    if (!token) {
      setStatus("error");
      setErrorMessage("Lien de connexion invalide ou manquant.");
      return;
    }

    authClient.magicLink
      .verify({ query: { token } })
      .then(async (result) => {
        if (result.error) {
          setStatus("error");
          setErrorMessage(
            result.error.message ?? "Le lien de connexion est invalide ou a expiré.",
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
          router.replace("/profile");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Une erreur est survenue lors de la vérification du lien.");
      });
  }, [router.isReady, router.query.token, router.replace]);

  return (
    <Layout pageTitle="Connexion par lien magique">
      <div className="p-4 max-w-[400px] mx-auto text-center mt-16">
        {status === "loading" && (
          <>
            <h2 className="text-xl font-bold mb-4">Connexion en cours...</h2>
            <span className="loading loading-spinner loading-lg" />
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-success">Connexion réussie !</h2>
            <p className="mb-6 text-gray-600">Redirection vers votre profil...</p>
            <span className="loading loading-spinner loading-md" />
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-error">Lien invalide</h2>
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
