import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import AdCard from "@/components/AdCard";
import Layout from "@/components/Layout";
import Loader from "@/components/Loader";
import { useSearchAdsQuery } from "@/graphql/generated/schema";

export default function Search() {
  const router = useRouter();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams(router.asPath.split("?")[1] || "");
    return {
      titleContains: params.get("titleContains") || undefined,
      categoryId: params.get("categoryId")
        ? parseInt(params.get("categoryId") ?? "0", 10)
        : undefined,
      limit: params.get("limit") ? parseInt(params.get("limit") ?? "O", 10) : 20,
      sortBy: params.get("sortBy") || "createdAt",
      order: params.get("order") || "desc",
    };
  }, [router.asPath]);

  const { data, loading, error } = useSearchAdsQuery({
    variables: searchParams,
  });

  const ads = data?.ads || [];

  return (
    <Layout pageTitle="recherche - TGC">
      {loading && <Loader />}
      {error && (
        <div className="p-4 text-red-600">Une erreur est survenue lors de la recherche</div>
      )}
      {ads.length === 0 && !loading && (
        <div className="p-4">
          <p className="pb-4 pt-12 text-center">
            Aucune annonce ne correspond à ces critères de recherche
          </p>

          <div className="text-center">
            <Link
              href="/search"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Voir toutes les annonces
            </Link>
          </div>
        </div>
      )}

      <div className="pt-6 pb-20 flex flex-wrap p-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </Layout>
  );
}
