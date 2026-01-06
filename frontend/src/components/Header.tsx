import Link from "next/link";
import CategoriesNav from "./CategoriesNav";
import SearchInput from "./SearchInput";

export default function Header() {
  return (
    <header className="p-4 border-b border-gray-400 flex flex-col w-full gap-4">
      {/* Small screen layout: Title + Publish button on same line */}
      <div className="flex flex-row justify-between items-center md:hidden">
        <Link href="/" className="w-max">
          <h1 className="text-orange-600 text-2xl font-bold">The good corner</h1>
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
            <h1 className="text-orange-600 text-2xl font-bold">The good corner</h1>
          </Link>

          <SearchInput inputClassName="w-sm" />
        </div>

        <div className="flex gap-2">
          <Link href="/signup" className="btn btn-outline btn-sm">
            S'inscrire
          </Link>
          <Link href="/admin/tags" className="btn btn-outline btn-sm">
            Admin Tags
          </Link>
          <Link href="/admin/categories" className="btn btn-outline btn-sm">
            Admin Catégories
          </Link>
          <Link href="/newAd" className="btn btn-primary">
            Publier
          </Link>
        </div>
      </div>

      <CategoriesNav />
    </header>
  );
}
