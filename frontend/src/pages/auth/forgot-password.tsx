import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    try {
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000"}/auth/reset-password`,
      });
    } catch (_e) {
      // Intentionally silent — we never reveal whether the email exists
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <Layout pageTitle="Mot de passe oublié">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Mot de passe oublié ?</h2>

        {submitted ? (
          <div className="text-center">
            <p className="text-gray-700 mb-6">
              Si cet email existe, un lien de réinitialisation vous a été envoyé. Vérifiez votre
              boîte mail.
            </p>
            <a href="/login" className="btn btn-outline">
              Retour à la connexion
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre
              mot de passe.
            </p>

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

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
            </button>

            <div className="text-center">
              <a href="/login" className="text-sm text-blue-600 hover:underline">
                Retour à la connexion
              </a>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
