import type { Ad } from "@/types";

type AdCardProps = {
	ad: Ad;
};
export default function AdCard({
	ad: { price, title, pictureUrl },
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
				<button
					type="button"
					className="absolute top-6 right-6 cursor-pointer group p-3 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
				>
					<svg
						className="w-6 h-6 text-gray-500 group-hover:hidden transition-all"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<title>mettre en favori</title>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 21s-6.5-4.35-9-8.5A5.5 5.5 0 0112 4a5.5 5.5 0 019 8.5c-2.5 4.15-9 8.5-9 8.5z"
						/>
					</svg>

					<svg
						className="w-6 h-6 text-red-500 hidden group-hover:block transform transition-all duration-300 group-hover:scale-110"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<title>retirer des favoris</title>
						<path d="M12 21s-6.5-4.35-9-8.5A5.5 5.5 0 0112 4a5.5 5.5 0 019 8.5c-2.5 4.15-9 8.5-9 8.5z" />
					</svg>
				</button>
				<div className="flex justify-between pt-6">
					<div className="ad-card-title">{title}</div>
					<div className="ad-card-price">{price} €</div>
				</div>
			</div>
		</div>
	);
}
