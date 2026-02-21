import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token as string | undefined;

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
            await fetch("http://localhost:4000/api/auth-bridge", {
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
        setErrorMessage("Une erreur est survenue lors de la vérification.");
      });
  }, [router.isReady, router.query.token, router.replace]);

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
