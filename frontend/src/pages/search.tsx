import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdCard from "@/components/AdCard";
import Layout from "@/components/Layout";
import type { Ad } from "@/types";

export default function Search() {
	const [ads, setAds] = useState<Ad[]>([]);
	const router = useRouter();

	useEffect(() => {
		const url = new URL(`http://localhost:3000${router.asPath}`);
		fetch(`http://localhost:4000/ads?${url.searchParams}`)
			.then((res) => res.json())
			.then((data) => {
				console.table(data);
				setAds(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [router.asPath]);

	return (
		<Layout pageTitle="recherche - TGC">
			{ads.length === 0 && (
				<div className="p-4">
					<p className="pb-4 pt-12 text-center">
						{" "}
						Aucune annonce ne corresspond à ces critères de recherche
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
