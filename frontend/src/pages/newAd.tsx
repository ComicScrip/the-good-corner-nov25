import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import type { Category } from "@/types";

export default function NewAd() {
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
		<Layout pageTitle="Création d'une annonce">
			<div className="p-4">
				<h2 className="text-xl font-bold">Nouvelle annonce</h2>
				<form>
					<div className="my-2">
						<label htmlFor="name">Titre</label>
						<input
							type="text"
							name="title"
							id="name"
							className="m-2 p-2 border"
							required
						/>
					</div>

					<div className="my-2">
						<select name="category" id="category">
							{categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>

					<button
						className="p-2 bg-amber-600 hover:bg-amber-700 cursor-pointer text-white"
						type="submit"
					>
						Sauvegarder
					</button>
				</form>
			</div>
		</Layout>
	);
}
