import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

interface FavoriteButtonProps {
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
}

export default function FavoriteButton({ defaultActive = false, onChange }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(defaultActive);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newState = !isFav;
    setIsFav(newState);
    onChange?.(newState);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-full transition-colors duration-300 bg-gray-100 cursor-pointer"
    >
      {isFav ? (
        <HeartSolid
          data-testid="favorite-on"
          className="w-7 h-7 text-red-500 transition-transform duration-300 transform scale-110"
        />
      ) : (
        <HeartOutline
          data-testid="favorite-off"
          className="w-7 h-7 text-gray-500 transition-transform duration-300 hover:scale-110"
        />
      )}
    </button>
  );
}
