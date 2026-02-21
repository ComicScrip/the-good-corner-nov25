import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { type SignupInput, useSignupMutation } from "@/graphql/generated/schema";
import { authClient } from "@/lib/authClient";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

type Mode = "password" | "magiclink";

export default function Signup() {
  const [mode, setMode] = useState<Mode>("password");

  // password mode state
  const [emailSent, setEmailSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signup, { loading: isSubmitting, error }] = useSignupMutation();

  // magic link mode state
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupInput>();

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup({ variables: { data } });
      setSignupEmail(data.email);
      setEmailSent(true);
    } catch (err) {
      console.error(err);
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
      callbackURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth-bridge`,
    });
  };

  // --- Confirmation screens ---

  if (emailSent) {
    return (
      <Layout pageTitle="Inscription">
        <div className="text-center p-4 max-w-[400px] mx-auto mt-16">
          <h2 className="text-xl font-bold mb-4">Vérifiez votre boîte mail</h2>
          <p className="text-gray-700 mb-2">
            Un email de vérification a été envoyé à <strong>{signupEmail}</strong>.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
          <a href="/login" className="btn btn-outline">
            Aller à la connexion
          </a>
        </div>
      </Layout>
    );
  }

  if (magicLinkSent) {
    return (
      <Layout pageTitle="Inscription">
        <div className="text-center p-4 max-w-[400px] mx-auto mt-16">
          <h2 className="text-xl font-bold mb-4">Consultez votre boîte mail</h2>
          <p className="text-gray-600 mb-2">
            Un lien de connexion a été envoyé à <strong>{magicLinkEmail}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Cliquez sur le lien dans l'email pour créer et activer votre compte. Il expire dans 10 minutes.
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
    <Layout pageTitle="Inscription">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Créer un compte</h2>

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
          />

          {mode === "password" ? (
            <>
              <Field
                label="Mot de passe"
                inputProps={{
                  ...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message: "Le mot de passe doit contenir au moins 8 caractères",
                    },
                    maxLength: {
                      value: 128,
                      message: "Le mot de passe ne peut pas dépasser 128 caractères",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
                    },
                  }),
                  type: "password",
                  placeholder: "Votre mot de passe sécurisé",
                }}
                id="password"
                error={errors.password?.message}
              />

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Inscription..." : "S'inscrire"}
              </button>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => setMode("magiclink")}
                  className="text-blue-600 hover:underline"
                >
                  S'inscrire sans mot de passe avec un lien magique
                </button>
              </div>
            </>
          ) : (
            <>
              {magicLinkError && (
                <p className="text-red-500 text-sm">{magicLinkError}</p>
              )}
              <button
                type="button"
                disabled={magicLinkLoading}
                onClick={handleMagicLink}
                className="btn btn-primary w-full"
              >
                {magicLinkLoading ? "Envoi en cours..." : "Recevoir un lien d'inscription"}
              </button>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => { setMode("password"); setMagicLinkError(null); }}
                  className="text-blue-600 hover:underline"
                >
                  Créer un compte avec un mot de passe
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
            className="btn btn-outline w-full"
          >
            Continuer avec GitHub
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="btn btn-outline w-full"
          >
            Continuer avec Google
          </button>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-center">
            {error.message || "Une erreur est survenue lors de l'inscription"}
          </p>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
