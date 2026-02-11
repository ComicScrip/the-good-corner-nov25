import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { type NewAdInput, useCategoriesQuery, useTagsQuery } from "@/graphql/generated/schema";
import Field from "./Field";
import LongTextField from "./LongTextField";
import SelectField from "./SelectField";

interface AdFormPorps {
  onSubmit: (data: NewAdInput) => any;
  isSubmitting: boolean;
  defaultValues?: NewAdInput;
}

export default function AdForm({ onSubmit, isSubmitting, defaultValues }: AdFormPorps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  const { data } = useCategoriesQuery();
  const categories = data?.categories || [];
  const { data: tagsData } = useTagsQuery();
  const tags = tagsData?.tags || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-12">
      <Field
        label="Titre"
        inputProps={{
          ...register("title", {
            required: "Le titre est requis",
            minLength: { value: 5, message: "Le titre doit contenir au moins 5 caractères" },
            maxLength: { value: 50, message: "Le titre doit contenir au plus 50 caractères" },
          }),
          placeholder: "Zelda : Ocarina of time",
        }}
        id="title"
        error={errors.title?.message}
        testId="ad-title"
      />

      <Field
        label="Localisation"
        inputProps={{
          ...register("location", { required: "La localisation est requise" }),
          placeholder: "Paris",
        }}
        id="location"
        error={errors.location?.message}
        testId="ad-location"
      />

      <Field
        label="Prix"
        inputProps={{
          ...register("price", {
            required: "Le prix est requis",
            min: { value: 0, message: "Le prix doit être positif" },
            valueAsNumber: true,
          }),
          type: "number",
        }}
        id="price"
        error={errors.price?.message}
        testId="ad-price"
      />

      <Field
        label="Image"
        inputProps={{
          ...register("pictureUrl", {
            required: "L'URL de l'image est requise",
            pattern: {
              value: /^https:\/\/.+/,
              message: "L'URL doit commencer par https://",
            },
          }),
          placeholder: "https://imageshack.com/zoot.png",
        }}
        id="pictureUrl"
        error={errors.pictureUrl?.message}
        testId="ad-picture-url"
      />

      <SelectField
        label="Catégorie"
        id="category"
        inputProps={register("category.id", {
          required: "La catégorie est requise",
          setValueAs: (val) => parseInt(val, 10),
        })}
        options={categories.map((c) => ({ label: c.name, val: c.id.toString() }))}
        error={errors.category?.message}
        noChoiceText="Sélectionnez une catégorie"
        testId="ad-category"
      />

      <div className="form-control w-full mb-3">
        <label htmlFor="tags" className="label">
          <span className="label-text">Tags</span>
        </label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <div data-testid="ad-tags">
              <Select
                {...field}
                options={tags}
                value={tags.filter((t) => (field.value || []).map((t) => t.id).includes(t.id))}
                onChange={(selected) => field.onChange(selected.map((t) => ({ id: t.id })))}
                getOptionValue={(o) => o.id.toString()}
                getOptionLabel={(o) => o.name}
                isMulti
                id="tags"
                closeMenuOnSelect={false}
                placeholder="Sélectionnez des tags..."
              />
            </div>
          )}
        />
      </div>

      <LongTextField
        label="Description"
        inputProps={{
          ...register("description"),
          placeholder:
            "The Legend of Zelda: Ocarina of Time est un jeu vidéo d'action-aventure développé par Nintendo EAD et édité par Nintendo sur Nintendo 64. Ocarina of Time raconte l'histoire de Link, un jeune garçon vivant dans un village perdu dans la forêt, qui parcourt le royaume d'Hyrule pour empêcher Ganondorf d'obtenir la Triforce, une relique sacrée partagée en trois : le courage (Link), la sagesse (Zelda) et la force (Ganondorf).",
        }}
        id="description"
        error={errors.description?.message}
        testId="ad-description"
      />

      <button
        type="submit"
        className="btn btn-primary mt-12 w-full"
        disabled={isSubmitting}
        data-testid="ad-submit"
      >
        {isSubmitting ? "Sauvegarde en cours" : "Sauvegarder"}
      </button>
    </form>
  );
}
