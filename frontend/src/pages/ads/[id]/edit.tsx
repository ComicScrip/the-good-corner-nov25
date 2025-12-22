import { useRouter } from "next/router";
import AdForm from "@/components/AdForm";
import Layout from "@/components/Layout";
import Loader from "@/components/Loader";
import { useAdQuery, useUpdateAdMutation } from "@/graphql/generated/schema";

export default function EditAd() {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading: loadingAd } = useAdQuery({
    variables: { adId: parseInt(id as string, 10) },
    skip: !id,
  });

  const [updateAd, { loading: isSubmitting, error }] = useUpdateAdMutation();

  const ad = data?.ad;

  // Transform ad data to match form format
  const defaultValues = ad ? {
    title: ad.title,
    location: ad.location,
    price: ad.price,
    pictureUrl: ad.pictureUrl,
    category: { id: ad.category.id },
    tags: ad.tags.map(tag => ({ id: tag.id })),
    description: ad.description || "",
  } : undefined;

  if (loadingAd || !ad) {
    return (
      <Layout pageTitle="Modification d'annonce">
        <div className="p-4 max-w-[600px] mx-auto">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`Modifier ${ad.title}`}>
      <div className="p-4 max-w-[600px] mx-auto">
        <h2 className="text-xl font-bold my-6 text-center">Modifier l'annonce</h2>
        <AdForm
          onSubmit={async (formData) => {
            try {
              await updateAd({
                variables: {
                  updateAdId: parseInt(id as string, 10),
                  data: formData
                }
              });
              router.push(`/ads/${id}`);
            } catch (err) {
              console.error(err);
            }
          }}
          isSubmitting={isSubmitting}
          defaultValues={defaultValues}
        />
        {error && (
          <p className="text-red-500 mt-4">Une erreur est survenue lors de la modification</p>
        )}
      </div>
    </Layout>
  );
}
