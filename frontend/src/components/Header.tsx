import Link from "next/link";
import { useRouter } from "next/router";
import SearchInput from "./SearchInput";
import CategoriesNav from "./CategoriesNav";

export default function Header() {
	const router = useRouter();

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

			<CategoriesNav />
		</header>
	);
}
