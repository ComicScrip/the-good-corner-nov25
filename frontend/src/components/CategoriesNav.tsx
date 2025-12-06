import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Category } from "@/types";

export default function CategoriesNav() {
	const router = useRouter();
	const [categories, setCategories] = useState<Category[]>([]);

	useEffect(() => {
		fetch("http://localhost:4000/categories")
			.then((res) => res.json())
			.then((data) => {
				setCategories(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	const handleCategoryClick = (categoryId: number) => {
		const params = new URLSearchParams(window.location.search);
		const isActive = router.query.categoryId === categoryId.toString();

		if (!isActive) {
			params.set("categoryId", categoryId.toString());
		}

		router.push(`/search?${params.toString()}`);
	};

	return (
		<nav className="flex carousel-horizontal max-w-[100vw]">
			{categories.map((cat) => {
				const [firstLetter, ...restOfCatName] = cat.name.split("");
				const catName = firstLetter.toUpperCase() + restOfCatName.join("");
				const isActive = router.query.categoryId === cat.id.toString();

				return (
					<button
						type="button"
						className={`p-2 rounded-lg cursor-pointer ${
							isActive ? "bg-[#ffa41b] text-white" : ""
						}`}
						onClick={() => handleCategoryClick(cat.id)}
						key={cat.id}
					>
						{catName}
					</button>
				);
			})}
		</nav>
	);
}
