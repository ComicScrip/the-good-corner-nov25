import { useEffect, useState } from "react";
import type { Ad } from "@/types";
import AdCard from "./AdCard";

export default function RecentAds() {
	const [ads, setAds] = useState<Ad[]>([]);

	useEffect(() => {
		fetch("http://localhost:4000/ads")
			.then((res) => res.json())
			.then((data) => {
				setAds(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-6">Annonces récentes</h2>
			<div className="flex flex-wrap">
				{ads.map((a) => (
					<AdCard ad={a} key={a.id} />
				))}
			</div>
		</div>
	);
}
