import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function AdDetail() {
	const router = useRouter();
	return (
		<Layout pageTitle="Détails d'une annonce">
			<div className="p-4">Détails de l'annonce n° {router.query.id}</div>
		</Layout>
	);
}
