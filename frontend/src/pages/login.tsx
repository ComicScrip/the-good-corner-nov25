import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

type FormValues = { email: string; password: string };
type Mode = "password" | "magiclink";

export default function Login() {
  const FRONTEND_URL = window?.location?.origin ?? "http://localhost:3000";

  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    setUnverifiedEmail(null);
    setResendSent(false);
    setIsSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(data.email);
        } else if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
          setSubmitError("Email ou mot de passe incorrect");
        } else {
          setSubmitError(result.error.message ?? "Email ou mot de passe incorrect.");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: `${FRONTEND_URL}/auth/verify-email`,
      });
      setResendSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const email = getValues("email");
    if (!email) return;
    setMagicLinkError(null);
    setMagicLinkLoading(true);
    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: `${FRONTEND_URL}/auth/magic-link/verify`,
      });
      if (result.error) {
        setMagicLinkError(result.error.message ?? "Une erreur est survenue.");
      } else {
        setMagicLinkEmail(email);
        setMagicLinkSent(true);
      }
    } catch {
      setMagicLinkError("Une erreur est survenue lors de l'envoi du lien.");
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: `${FRONTEND_URL}/`,
    });
  };

  const handlePasskeyLogin = async () => {
    const result = await authClient.signIn.passkey();
    if (result && !result.error) {
      router.push("/");
    }
  };

  if (magicLinkSent) {
    return (
      <Layout pageTitle="Connexion">
        <div className="p-4 max-w-[400px] mx-auto text-center mt-16">
          <h2 className="text-xl font-bold mb-4">Consultez votre boîte mail</h2>
          <p className="text-gray-600 mb-2">
            Un lien de connexion a été envoyé à <strong>{magicLinkEmail}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Cliquez sur le lien dans l'email pour vous connecter. Il expire dans 10 minutes.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setMagicLinkSent(false);
              setMagicLinkEmail("");
            }}
          >
            Retour
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Connexion">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Se connecter</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field
            label="Email"
            inputProps={{
              ...register("email", {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "L'email n'est pas valide",
                },
              }),
              type: "email",
              placeholder: "votre.email@example.com",
            }}
            id="email"
            error={errors.email?.message}
            testId="login-email"
          />

          {mode === "password" ? (
            <>
              <Field
                label="Mot de passe"
                inputProps={{
                  ...register("password", {
                    required: "Le mot de passe est requis",
                  }),
                  type: "password",
                  placeholder: "Votre mot de passe",
                }}
                id="password"
                error={errors.password?.message}
                testId="login-password"
              />

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setMode("magiclink")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Recevoir un lien magique
                </button>
                <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
            </>
          ) : (
            <>
              {magicLinkError && <p className="text-red-500 text-sm">{magicLinkError}</p>}
              <button
                type="button"
                disabled={magicLinkLoading}
                onClick={handleMagicLink}
                className="btn btn-primary w-full"
              >
                {magicLinkLoading ? "Envoi en cours..." : "Recevoir un lien de connexion"}
              </button>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setMagicLinkError(null);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Utiliser mon mot de passe
                </button>
              </div>
            </>
          )}
        </form>

        <div className="divider my-4 text-sm text-gray-400">ou</div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="btn btn-outline w-full flex items-center gap-2"
          >
            Continuer avec GitHub
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="btn btn-outline w-full flex items-center gap-2"
          >
            Continuer avec Google
          </button>
          <button
            type="button"
            onClick={handlePasskeyLogin}
            className="btn btn-outline w-full flex items-center gap-2"
          >
            Se connecter avec une clé d'accès
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              S'inscrire
            </a>
          </p>
        </div>

        {submitError && (
          <p className="text-red-500 mt-4 text-center" data-testid="login-errors">
            {submitError}
          </p>
        )}

        {unverifiedEmail && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-center">
            <p className="text-yellow-800 mb-2">Votre adresse email n'a pas encore été vérifiée.</p>
            {resendSent ? (
              <p className="text-green-700">Email de vérification envoyé !</p>
            ) : (
              <button
                type="button"
                className="text-blue-600 hover:underline"
                disabled={resendLoading}
                onClick={handleResendVerification}
              >
                {resendLoading ? "Envoi..." : "Renvoyer l'email de vérification"}
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
