import { MapPinIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Loader from "@/components/Loader";
import {
  useAdQuery,
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

  const ad = data?.ad;

  const currentUserHasWriteAccess =
    currentUser?.role === "admin" || ad?.author.id === currentUser?.id;

  return (
    <Layout pageTitle={ad?.title ? `${ad.title} - TGC` : "The Good Corner"}>
      <div className="pb-12 mt-12 max-w-[800px] mx-auto">
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

              <div className="flex gap-4">
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
