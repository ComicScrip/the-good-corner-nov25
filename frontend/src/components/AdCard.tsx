import type { Ad } from "@/types";

interface AdCardProps {
	ad: Ad;
}

export default function AdCard({
	ad: { title, price, pictureUrl },
}: AdCardProps) {
	return (
		<div className="w-[400px]">
			<div className="relative shadow-md border rounded-lg p-4 bg-white mr-3 mb-3">
				{/** biome-ignore lint/performance/noImgElement: images come form unknown domains */}
				<img
					className="h-[200px] w-full object-cover rounded-md"
					src={pictureUrl}
					alt={title}
				/>
				<div className="flex justify-between pt-6">
					<div className="ad-card-title">{title}</div>
					<div className="ad-card-price">{price} €</div>
				</div>
			</div>
		</div>
	);
}
