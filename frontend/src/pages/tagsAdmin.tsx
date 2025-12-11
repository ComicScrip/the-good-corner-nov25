import Layout from "@/components/Layout";
import { useCreateTagMutation, useTagsQuery } from "@/graphql/generated/schema";
import { FormEvent } from "react";




export default function TagAdmin() {
   const { data, refetch } = useTagsQuery();
   const tags = data?.tags || [];
   const [createTag] = useCreateTagMutation();

   function handleSubmit(event: FormEvent<HTMLFormElement>): void {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;

      console.log("Nouveau tag à ajouter :", name);
      createTag({ variables: { data: { name } } })
         .then(() => {
            console.log("Tag créé avec succès");
            refetch();
            (event.target as any).reset() // TODO: fix types
         })
         .catch((error) => {
            console.error("Erreur lors de la création du tag :", error);
         })
   }

   return (
      <Layout pageTitle="Admin des Tags">

         <div>
            <h2> Administration des Tags</h2>
            <form onSubmit={handleSubmit} className="pb-12">
               <label className="label" htmlFor="name">
                  <span className="label-text">Nom du Tag :</span>
               </label>
               <input
                  type="text"
                  required
                  name="name"
                  id="name"
               />
               <button type="submit">Envoyer</button>
            </form>
            {tags.map((tag) => (
               <p key={tag.id}>{tag.name}</p>
            ))}
         </div>
      </Layout>
   );
}
