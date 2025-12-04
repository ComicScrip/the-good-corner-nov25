import { useRouter } from "next/router";
import type { FormEvent } from "react";
import Layout from "@/components/Layout";

export default function NewAd() {
	const router = useRouter();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const toSend = Object.fromEntries(formData.entries()) as any;
		toSend.price = parseFloat(toSend.price);
		console.log("sending new ad : ", toSend);

		fetch("http://localhost:4000/ads", {
			method: "POST",
			body: JSON.stringify(toSend),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => {
				console.log("response from API : ", data);
				router.push(`/ads/${data.id}`);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	return (
		<Layout pageTitle="Création d'une annonce">
			<div className="p-4 max-w-[600px] mx-auto">
				<h2 className="text-xl font-bold my-6 text-center">Nouvelle annonce</h2>
				<form onSubmit={handleSubmit} className="pb-12">
					<div className="form-control w-full mb-3">
						<label className="label" htmlFor="title">
							<span className="label-text">Titre</span>
						</label>
						<input
							required
							type="text"
							name="title"
							id="title"
							placeholder="Zelda : Ocarina of time"
							className="input input-bordered w-full"
						/>
					</div>

					<div className="form-control w-full mb-3">
						<label className="label" htmlFor="location">
							<span className="label-text">Localisation</span>
						</label>
						<input
							type="text"
							name="location"
							id="location"
							required
							placeholder="Paris"
							className="input input-bordered w-full"
						/>
					</div>

					<div className="form-control w-full mb-3">
						<label className="label" htmlFor="price">
							<span className="label-text">Prix</span>
						</label>
						<input
							required
							type="number"
							name="price"
							id="price"
							min={0}
							placeholder="30"
							className="input input-bordered w-full"
						/>
					</div>

					<div className="form-control w-full mb-3">
						<label className="label" htmlFor="pictureUrl">
							<span className="label-text">Image</span>
						</label>
						<input
							type="text"
							name="pictureUrl"
							id="pictureUrl"
							required
							placeholder="https://imageshack.com/zoot.png"
							className="input input-bordered w-full"
						/>
					</div>

					<button type="submit" className="btn btn-primary mt-12 w-full">
						Envoyer
					</button>
				</form>
			</div>
		</Layout>
	);
}
