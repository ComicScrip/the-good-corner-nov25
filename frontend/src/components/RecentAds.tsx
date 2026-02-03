import { useRecentAdsQuery } from "@/graphql/generated/schema";
import AdCard from "./AdCard";
import Loader from "./Loader";

export default function RecentAds() {
  const { data, loading, error } = useRecentAdsQuery();
  const ads = data?.ads || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-6">Annonces récentes update</h2>
      <div className="flex flex-wrap">
        {loading && <Loader />}
        {error && (
          <div className="text-red-600">
            Une erreur est survenue lors de la récupération des données
          </div>
        )}
        {ads.map((a) => (
          <AdCard ad={a} key={a.id} />
        ))}
      </div>
    </div>
  );
}
