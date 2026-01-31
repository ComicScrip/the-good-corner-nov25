import Link from "next/link";
import type { Ad } from "@/types";
import FavoriteButton from "./FavoriteButton";

interface AdCardProps {
  ad: Ad;
}

export default function AdCard({ ad: { id, title, pictureUrl, price } }: AdCardProps) {
  return (
    <Link href={`/ads/${id}`} className="w-[400px] cursor-pointer">
      <div className="relative shadow-md border rounded-lg p-4 bg-white mr-3 mb-3">
        {/** biome-ignore lint/performance/noImgElement: images come form unknown domains */}
        <img className="h-[200px] w-full object-cover rounded-md" src={pictureUrl} alt={title} />
        <div className="flex justify-between pt-6">
          <div className="ad-card-title">{title}</div>
          <div className="ad-card-price">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 2,
            }).format(price)}
          </div>
        </div>
        <div className="absolute top-6 right-6">
          <FavoriteButton />
        </div>
      </div>
    </Link>
  );
}
