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
		<header className="p-4 border-b border-gray-400 flex flex-col w-full gap-4">
			{/* Small screen layout: Title + Publish button on same line */}
			<div className="flex flex-row justify-between items-center sm:hidden">
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
			<form
				className="sm:hidden"
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const search = (formData.get("titleContains") as string) || "";
					const params = new URLSearchParams(window.location.search);
					params.set("titleContains", search);
					router.push(`/search?${params.toString()}`);
				}}
			>
				<label className="input">
					<svg
						className="h-[1em] opacity-50"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<title>search</title>
						<g
							strokeLinejoin="round"
							strokeLinecap="round"
							strokeWidth="2.5"
							fill="none"
							stroke="currentColor"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.3-4.3"></path>
						</g>
					</svg>
					<input
						className="w-full"
						type="search"
						required
						placeholder="Rechercher une annonce"
						name="titleContains"
					/>
				</label>
			</form>

			{/* Large screen layout: Title + Search + Publish button */}
			<div className="hidden sm:flex sm:flex-row sm:justify-between sm:items-center">
				<div className="flex flex-row items-center gap-4">
					<Link href="/" className="w-max">
						<h1 className="text-orange-600 text-2xl font-bold">
							The good corner
						</h1>
					</Link>

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
						<label className="input">
							<svg
								className="h-[1em] opacity-50"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
							>
								<title>search</title>
								<g
									strokeLinejoin="round"
									strokeLinecap="round"
									strokeWidth="2.5"
									fill="none"
									stroke="currentColor"
								>
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.3-4.3"></path>
								</g>
							</svg>
							<input
								className="w-sm"
								type="search"
								required
								placeholder="Rechercher une annonce"
								name="titleContains"
							/>
						</label>
					</form>
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
		</header>
	);
}
