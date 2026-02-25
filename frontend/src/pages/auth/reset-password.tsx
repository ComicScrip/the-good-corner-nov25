import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import Layout from "@/components/Layout";
import { authClient } from "@/lib/authClient";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  useEffect(() => {
    if (router.isReady) {
      const t = router.query.token as string | undefined;
      setToken(t ?? null);
    }
  }, [router.isReady, router.query.token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setServerError("Lien de réinitialisation invalide ou manquant.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const result = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (result.error) {
        setServerError(result.error.message ?? "Une erreur est survenue. Veuillez réessayer.");
      } else {
        router.push("/login");
      }
    } catch (_e) {
      setServerError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!router.isReady) {
    return (
      <Layout pageTitle="Réinitialisation du mot de passe">
        <div className="flex justify-center mt-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </Layout>
    );
  }

  if (!token) {
    return (
      <Layout pageTitle="Réinitialisation du mot de passe">
        <div className="p-4 max-w-[400px] mx-auto text-center mt-16">
          <h2 className="text-xl font-bold mb-4 text-error">Lien invalide</h2>
          <p className="mb-6 text-gray-600">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <a href="/auth/forgot-password" className="btn btn-primary">
            Demander un nouveau lien
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Réinitialisation du mot de passe">
      <div className="p-4 max-w-[400px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Nouveau mot de passe</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field
            label="Nouveau mot de passe"
            inputProps={{
              ...register("newPassword", {
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
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
                },
              }),
              type: "password",
              placeholder: "Votre nouveau mot de passe",
            }}
            id="newPassword"
            error={errors.newPassword?.message}
          />

          <Field
            label="Confirmer le mot de passe"
            inputProps={{
              ...register("confirmPassword", {
                required: "Veuillez confirmer votre mot de passe",
                validate: (value) =>
                  value === watch("newPassword") || "Les mots de passe ne correspondent pas",
              }),
              type: "password",
              placeholder: "Répétez votre mot de passe",
            }}
            id="confirmPassword"
            error={errors.confirmPassword?.message}
          />

          {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
