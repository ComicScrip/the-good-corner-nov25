import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import Layout from "@/components/Layout";
import { useCategoriesQuery, useCreateAdMutation, useTagsQuery } from "@/graphql/generated/schema";
import type { Tag } from "@/types";

interface FormData {
  title: string;
  location: string;
  price: number;
  pictureUrl: string;
  category: {
    id: number;
  };
  description: string;
  tags: { id: number }[];
}

export default function NewAd() {
  const router = useRouter();

  const { data } = useCategoriesQuery();
  const { data: tagsData } = useTagsQuery();

  const categories = data?.categories || [];
  const tags = tagsData?.tags || [];

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [createAd, { loading: isSubmitting }] = useCreateAdMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log({ data });
    /*
    try {
      const toSend = {
        ...data,
        tags: selectedTags.map((t) => ({ id: t.id })),
      };

      const response = await createAd({ variables: { data: toSend } });
      router.push(`/ads/${response.data?.createAd.id}`);
    } catch (err) {
      console.error(err);
    }
      */
  };

  return (
    <Layout pageTitle="Création d'une annonce">
      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Nouvelle annonce</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="pb-12">
          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="title">
              <span className="label-text">Titre</span>
            </label>
            <input
              {...register("title", { required: "Le titre est requis" })}
              type="text"
              id="title"
              placeholder="Zelda : Ocarina of time"
              className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
            />
            {errors.title && (
              <span className="text-error text-sm mt-1">{errors.title.message}</span>
            )}
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="location">
              <span className="label-text">Localisation</span>
            </label>
            <input
              {...register("location", { required: "La localisation est requise" })}
              type="text"
              id="location"
              placeholder="Paris"
              className={`input input-bordered w-full ${errors.location ? "input-error" : ""}`}
            />
            {errors.location && (
              <span className="text-error text-sm mt-1">{errors.location.message}</span>
            )}
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="price">
              <span className="label-text">Prix</span>
            </label>
            <input
              {...register("price", {
                required: "Le prix est requis",
                min: { value: 0, message: "Le prix doit être positif" },
                valueAsNumber: true,
              })}
              type="number"
              id="price"
              placeholder="30"
              className={`input input-bordered w-full ${errors.price ? "input-error" : ""}`}
            />
            {errors.price && (
              <span className="text-error text-sm mt-1">{errors.price.message}</span>
            )}
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="pictureUrl">
              <span className="label-text">Image</span>
            </label>
            <input
              {...register("pictureUrl", {
                required: "L'URL de l'image est requise",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "L'URL doit commencer par http:// ou https://",
                },
              })}
              type="text"
              id="pictureUrl"
              placeholder="https://imageshack.com/zoot.png"
              className={`input input-bordered w-full ${errors.pictureUrl ? "input-error" : ""}`}
            />
            {errors.pictureUrl && (
              <span className="text-error text-sm mt-1">{errors.pictureUrl.message}</span>
            )}
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="category">
              <span className="label-text">Catégorie</span>
            </label>
            <select
              {...register("category.id", {
                required: "La catégorie est requise",
                setValueAs: (val) => parseInt(val, 10),
              })}
              className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
              id="category"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-error text-sm mt-1">{errors.category.message}</span>
            )}
          </div>

          <div className="form-control w-full mb-3">
            <label htmlFor="tags" className="label">
              <span className="label-text">Tags</span>
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={tags}
                  getOptionValue={(o) => o.id.toString()}
                  getOptionLabel={(o) => o.name}
                  isMulti
                  id="tags"
                  value={selectedTags}
                  closeMenuOnSelect={false}
                  onChange={(tags) => {
                    console.log("onchange", { tags });

                    setSelectedTags(tags.slice());
                  }}
                  placeholder="Sélectionnez des tags..."
                />
              )}
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="description">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register("description")}
              rows={10}
              className={`textarea textarea-bordered w-full ${errors.description ? "textarea-error" : ""}`}
              placeholder="The Legend of Zelda: Ocarina of Time est un jeu vidéo d'action-aventure développé par Nintendo EAD et édité par Nintendo sur Nintendo 64. Ocarina of Time raconte l'histoire de Link, un jeune garçon vivant dans un village perdu dans la forêt, qui parcourt le royaume d'Hyrule pour empêcher Ganondorf d'obtenir la Triforce, une relique sacrée partagée en trois : le courage (Link), la sagesse (Zelda) et la force (Ganondorf)."
              id="description"
            />
            {errors.description && (
              <span className="text-error text-sm mt-1">{errors.description.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary mt-12 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sauvegarde en cours" : "Envoyer"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
