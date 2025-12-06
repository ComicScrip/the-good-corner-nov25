import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Category } from "@/types";
import SearchInput from "./SearchInput";

export default function Header() {
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

	return (
		<header className="p-4 border-b border-gray-400 flex flex-col w-full gap-4">
			{/* Small screen layout: Title + Publish button on same line */}
			<div className="flex flex-row justify-between items-center md:hidden">
				<Link href="/" className="w-max">
					<h1 className="text-orange-600 text-2xl font-bold">
						The good corner
					</h1>
				</Link>

				<Link href="/newAd" className="btn btn-primary">
					Publier
				</Link>
			</div>

			{/* Small screen search: below title and publish */}
			<SearchInput className="md:hidden" inputClassName="w-full" />

			{/* Large screen layout: Title + Search + Publish button */}
			<div className="hidden md:flex md:flex-row md:justify-between md:items-center">
				<div className="flex flex-row items-center gap-4">
					<Link href="/" className="w-max">
						<h1 className="text-orange-600 text-2xl font-bold">
							The good corner
						</h1>
					</Link>

					<SearchInput inputClassName="w-sm" />
				</div>

				<Link href="/newAd" className="btn btn-primary">
					Publier
				</Link>
			</div>

			<nav className="flex carousel-horizontal max-w-[100vw]">
				{categories.map((cat) => {
					const [firstLetter, ...resetOfCatName] = cat.name.split("");
					const catName = firstLetter.toUpperCase() + resetOfCatName.join("");
					const isActive = router.query.categoryId === cat.id.toString();

					return (
						<button
							type="button"
							className={`p-2 rounded-lg cursor-pointer ${
								isActive ? "bg-[#ffa41b] text-white" : ""
							}`}
							onClick={() => {
								const params = new URLSearchParams(window.location.search);
								if (!isActive) params.set("categoryId", cat.id.toString());
								router.push(`/search?${params.toString()}`);
							}}
							key={cat.id}
						>
							{catName}
						</button>
					);
				})}
			</nav>
		</header>
	);
}
