import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { type SignupInput, useSignupMutation } from "@/graphql/generated/schema";
import { authClient } from "@/lib/authClient";

export default function Signup() {
  const [emailSent, setEmailSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signup, { loading: isSubmitting, error }] = useSignupMutation();
  const {
    register,
    handleSubmit,
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

  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth-bridge`,
    });
  };

  return (
    <Layout pageTitle="Inscription">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Créer un compte</h2>

        {emailSent ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Un email de vérification a été envoyé à <strong>{signupEmail}</strong>.
            </p>
            <p className="text-gray-600 text-sm">
              Vérifiez votre boîte mail pour activer votre compte.
            </p>
            <div className="mt-6">
              <a href="/login" className="btn btn-outline">
                Aller à la connexion
              </a>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Layout>
  );
}
