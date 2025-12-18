import { useRouter } from "next/router";
import AdForm from "@/components/AdForm";
import Layout from "@/components/Layout";
import { useCreateAdMutation } from "@/graphql/generated/schema";

export default function NewAd() {
  const router = useRouter();
  const [createAd, { loading: isSubmitting, error }] = useCreateAdMutation();

  return (
    <Layout pageTitle="Création d'une annonce">
      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Nouvelle annonce</h2>
        <AdForm
          onSubmit={async (data) => {
            try {
              const response = await createAd({ variables: { data } });
              router.push(`/ads/${response.data?.createAd.id}`);
            } catch (err) {
              console.error(err);
            }
          }}
          isSubmitting={isSubmitting}
        />
        {error && (
          <p className="text-red-500">Une erreur est survenue lors de l'envoi de données</p>
        )}
      </div>
    </Layout>
  );
}
