import Header from "@/components/Header";
import RecentAds from "@/components/RecentAds";

export default function Home() {
	return (
		<>
			<Header />
			<main className="bg-gray-50">
				<RecentAds />
			</main>
		</>
	);
}
