import { useState } from "react";

export default function FavoriteButton() {
	const [isFav, setIsFav] = useState(false);

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				setIsFav(!isFav);
			}}
			className="bg-white p-2 rounded-2xl"
		>
			{isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
		</button>
	);
}
