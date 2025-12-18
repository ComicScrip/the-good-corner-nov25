import { type FormEvent, useState } from "react";
import Layout from "@/components/Layout";
import TagTable from "@/components/TagTable";
import { useCreateTagMutation, useTagsQuery } from "@/graphql/generated/schema";

export default function TagsAdmin() {
  const { data, refetch } = useTagsQuery();
  const tags = data?.tags || [];
  const [createTag] = useCreateTagMutation();
  const [formError, setFormError] = useState("");

  const validateTagName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return "Le nom doit contenir au moins 2 caractères";
    }
    if (trimmed.length > 20) {
      return "Le nom ne peut pas dépasser 20 caractères";
    }
    return "";
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;

    const error = validateTagName(name);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      await createTag({ variables: { data: { name: name.trim() } } });
      refetch();
      form.reset();
      setFormError("");
    } catch (error) {
      console.error("Erreur lors de la création du tag :", error);
    }
  }

  return (
    <Layout pageTitle="Admin des Tags">
      <div className="p-4">
        <h2 className="text-xl mb-4"> Administration des Tags</h2>
        <form onSubmit={handleSubmit} className="pb-12">
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text mr-4">Nom du Tag </span>
            </label>
            <input
              type="text"
              required
              name="name"
              id="name"
              className={`input input-bordered mr-4 ${formError ? "input-error" : ""}`}
              onChange={() => setFormError("")}
            />
            {formError && (
              <div className="label">
                <span className="label-text-alt text-error">{formError}</span>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Ajouter
          </button>
        </form>
        <TagTable tags={tags} onRefetch={refetch} />
      </div>
    </Layout>
  );
}
