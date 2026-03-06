import { MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "@/components/Layout";
import Loader from "@/components/Loader";
import {
  useAdQuery,
  useCreateCheckoutSessionMutation,
  useDeleteAdMutation,
  useProfileQuery,
  useRecentAdsQuery,
} from "@/graphql/generated/schema";

export default function AdDetails() {
  const { data: profileData } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const currentUser = profileData?.me || null;

  const { refetch } = useRecentAdsQuery();
  const router = useRouter();
  const { id } = router.query;

  const { data } = useAdQuery({
    variables: { adId: parseInt(id as string, 10) },
    skip: !router.isReady,
  });

  const [deleteAd] = useDeleteAdMutation();
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [buying, setBuying] = useState(false);

  const ad = data?.ad;
  const purchase = router.query.purchase as string | undefined;

  const currentUserHasWriteAccess =
    currentUser?.role === "admin" || ad?.author.id === currentUser?.id;

  const canBuy = currentUser !== null && ad?.author.id !== currentUser?.id && !ad?.sold;

  async function handleBuy() {
    if (!id) return;
    setBuying(true);
    try {
      const result = await createCheckoutSession({
        variables: { adId: parseInt(id as string, 10) },
      });
      const url = result.data?.createCheckoutSession;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la création de la session de paiement.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <Layout pageTitle={ad?.title ? `${ad.title} - TGC` : "The Good Corner"}>
      <div className="pb-12 mt-12 max-w-[800px] mx-auto">
        {purchase === "success" && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            🎉 Paiement réussi ! Votre achat a bien été pris en compte.
          </div>
        )}
        {purchase === "cancelled" && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            Le paiement a été annulé. Vous pouvez réessayer à tout moment.
          </div>
        )}
        <div className="p-6 bg-white shadow-lg rounded-2xl">
          {typeof ad === "undefined" ? (
            <Loader />
          ) : (
            <div>
              <div className=" flex justify-between items-start md:items-center">
                <div className="flex items-start md:items-center flex-col md:flex-row">
                  <h1 className="text-3xl">{ad.title}</h1>

                  <div className="md:ml-4 mt-4 md:mt-0">
                    {ad.tags.map((t) => (
                      <span
                        className="bg-slate-100 rounded-full p-2 mr-2 text-gray-600 border-slate-300 border "
                        key={t.id}
                      >
                        {t.name}
                      </span>
                    ))}
                    {ad.sold && (
                      <span className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-sm font-semibold border border-red-300">
                        Vendu
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-2xl">{ad.price} €</p>
              </div>

              {/** biome-ignore lint/performance/noImgElement: images come from unknow domains */}
              <img src={ad.pictureUrl} alt={ad.title} className="mt-6 mb-6" />
              <p className="mt-6 mb-6">{ad.description}</p>
              <div className="flex justify-between mb-6">
                <div className="flex items-center mt-2 ">
                  <MapPinIcon width={24} height={24} className="mr-2" /> {ad.location}
                </div>
              </div>

              <div className="flex gap-4 items-center flex-wrap">
                {canBuy && (
                  <button
                    type="button"
                    onClick={handleBuy}
                    disabled={buying}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 cursor-pointer text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    {buying ? "Redirection…" : `Acheter · ${ad.price} €`}
                  </button>
                )}

                {currentUserHasWriteAccess && (
                  <PencilIcon
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                    width={24}
                    height={24}
                    onClick={() => router.push(`/ads/${id}/edit`)}
                    title="Modifier l'annonce"
                  />
                )}

                {currentUserHasWriteAccess && (
                  <TrashIcon
                    className="cursor-pointer text-red-600 hover:text-red-800"
                    width={24}
                    height={24}
                    onClick={async () => {
                      if (
                        confirm("etes vous bien certain.e de vouloir supprimer cette annonce ?")
                      ) {
                        try {
                          await deleteAd({
                            variables: { deleteAdId: parseInt(id as string, 10) },
                          });
                          await refetch();
                          router.push("/");
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    title="Supprimer l'annonce"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
