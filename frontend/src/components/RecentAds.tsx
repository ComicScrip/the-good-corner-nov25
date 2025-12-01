import type { Ad } from "@/types";
import AdCard from "./AdCard";

export default function RecentAds() {
	const ads: Ad[] = [
		{
			id: 1,
			pictureUrl:
				"https://www.wizicar.com/wp-content/uploads/2020/01/nouvelle-peugeot-208.jpg",
			price: 5000,
			title: "Peugeot 208",
		},
		{
			id: 2,
			pictureUrl:
				"https://www.hom.com/media/catalog/product/cache/790421f214897a3493395295add0d504/h/a/harronew_tee-shirtcrewneck_405508_40m014_blackcombination.jpg",
			price: 5,
			title: "t-shirt noir",
		},
	];

	return (
		<div className="p-4">
			<h2 className="text-2xl mb-6">Annonces récentes</h2>
			<section className="flex flex-wrap pb-24">
				{ads.map((ad) => (
					<AdCard key={ad.id} ad={ad} />
				))}
			</section>
		</div>
	);
}
