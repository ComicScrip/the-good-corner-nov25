import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { type LoginInput, useLoginMutation } from "@/graphql/generated/schema";
import { authClient } from "@/lib/authClient";

export default function Login() {
  const router = useRouter();
  const [login, { loading: isSubmitting, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    try {
      await login({ variables: { data } });
      router.push("/");
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

  const handlePasskeyLogin = async () => {
    const result = await authClient.signIn.passkey();
    if (result && !result.error) {
      // better-auth set its session cookie; call the passkey bridge to mint our JWT cookie
      await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth-bridge-passkey`, {
        credentials: "include",
      });
      router.push("/");
    }
  };

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

        {error && (
          <p className="text-red-500 mt-4 text-center" data-testid="login-errors">
            {error.message || "Une erreur est survenue lors de la connexion"}
          </p>
        )}
      </div>
    </Layout>
  );
}
