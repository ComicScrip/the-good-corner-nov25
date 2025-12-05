import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Category } from "@/types";

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
		<header className="p-4 border-b border-gray-400 flex justify-between">
			<div>
				<Link href="/">
					<h1 className="text-orange-600 text-2xl font-bold">
						The good corner
					</h1>
				</Link>

				<nav className="flex h-[54px]">
					{categories.map((cat) => {
						const [firstLetter, ...resetOfCatName] = cat.name.split("");
						const catName = firstLetter.toUpperCase() + resetOfCatName.join("");
						const isActive = router.query.categoryId === cat.id.toString();

						return (
							<button
								type="button"
								className={`p-2 rounded-lg mt-3 cursor-pointer ${
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
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.target as HTMLFormElement);
						const search = (formData.get("titleContains") as string) || "";
						const params = new URLSearchParams(window.location.search);
						params.set("titleContains", search);
						router.push(`/search?${params.toString()}`);
					}}
				>
					<input type="text" name="titleContains" />
				</form>
			</div>

			<Link href="/newAd" className="btn btn-primary">
				Publier
			</Link>
		</header>
	);
}
