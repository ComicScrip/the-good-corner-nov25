import { MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import type { Ad } from "@/types";

export default function AdDetails() {
	const router = useRouter();
	const { id } = router.query;

	const [ad, setAd] = useState<Ad>();

	useEffect(() => {
		fetch(`http://localhost:4000/ads/${id}`)
			.then((res) => res.json())
			.then((data) => {
				setAd(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [id]);

	return (
		<Layout pageTitle={ad?.title ? `${ad.title} - TGC` : "The Good Corner"}>
			<div className="pb-12 mt-12 max-w-[800px] mx-auto">
				<div className="p-6 bg-white shadow-lg rounded-2xl">
					{typeof ad === "undefined" ? (
						<span className="loading loading-ring loading-md"></span>
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
									<MapPinIcon width={24} height={24} className="mr-2" />{" "}
									{ad.location}
								</div>
							</div>

							<div>
								<TrashIcon
									className="cursor-pointer"
									width={24}
									height={24}
									onClick={() => {
										if (
											confirm(
												"etes vous bien certain.e de vouloir supprimer cette annonce ?",
											)
										)
											fetch(`http://localhost:4000/ads/${id}`, {
												method: "DELETE",
											})
												.then((res) => res.json())
												.then((_data) => router.push("/"))
												.catch((err) => console.error(err));
									}}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
