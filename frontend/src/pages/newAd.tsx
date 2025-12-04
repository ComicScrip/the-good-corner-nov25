import Layout from "@/components/Layout";

export default function NewAd() {
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
