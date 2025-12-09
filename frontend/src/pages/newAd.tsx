import { useRouter } from "next/router";
import { type FormEvent, useEffect, useState } from "react";
import Select from "react-select";
import Layout from "@/components/Layout";
import type { AdInput, Category, Tag } from "@/types";

export default function NewAd() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/tags")
      .then((res) => res.json())
      .then((data) => {
        setTags(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const toSend = Object.fromEntries(formData.entries()) as unknown as AdInput;
    toSend.price = parseFloat(toSend.price as unknown as string);
    toSend.category = { id: toSend.category as unknown as number };
    toSend.tags = selectedTags.map((t) => ({ id: t.id }));

    try {
      const response = await fetch("http://localhost:4000/ads", {
        method: "POST",
        body: JSON.stringify(toSend),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("response from API : ", data);
      router.push(`/ads/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Création d'une annonce">
      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Nouvelle annonce</h2>
        <form onSubmit={handleSubmit} className="pb-12">
          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="title">
              <span className="label-text">Titre</span>
            </label>
            <input
              required
              type="text"
              name="title"
              id="title"
              placeholder="Zelda : Ocarina of time"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="location">
              <span className="label-text">Localisation</span>
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              placeholder="Paris"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="price">
              <span className="label-text">Prix</span>
            </label>
            <input
              required
              type="number"
              name="price"
              id="price"
              min={0}
              placeholder="30"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="pictureUrl">
              <span className="label-text">Image</span>
            </label>
            <input
              type="text"
              name="pictureUrl"
              id="pictureUrl"
              required
              placeholder="https://imageshack.com/zoot.png"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="category">
              <span className="label-text">Catégorie</span>
            </label>
            <select
              className="select select-bordered w-full"
              id="category"
              name="category"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full mb-3">
            <label htmlFor="tags" className="label">
              <span className="label-text">Tags</span>
            </label>
            <Select
              options={tags}
              getOptionValue={(o) => o.id.toString()}
              getOptionLabel={(o) => o.name}
              isMulti
              name="tags"
              id="tags"
              value={selectedTags}
              closeMenuOnSelect={false}
              onChange={(tags) => {
                setSelectedTags(tags.slice());
              }}
            />
          </div>

          <div className="form-control w-full mb-3">
            <label className="label" htmlFor="description">
              <span className="label-text">Description</span>
            </label>
            <textarea
              rows={10}
              className="textarea textarea-bordered w-full"
              placeholder="The Legend of Zelda: Ocarina of Time est un jeu vidéo d'action-aventure développé par Nintendo EAD et édité par Nintendo sur Nintendo 64. Ocarina of Time raconte l'histoire de Link, un jeune garçon vivant dans un village perdu dans la forêt, qui parcourt le royaume d'Hyrule pour empêcher Ganondorf d'obtenir la Triforce, une relique sacrée partagée en trois : le courage (Link), la sagesse (Zelda) et la force (Ganondorf)."
              name="description"
              id="description"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-12 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sauvegarde en cours" : "Envoyer"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
