import Link from "next/link";
import { useRouter } from "next/router";
import CategoriesNav from "./CategoriesNav";
import SearchInput from "./SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { useLogoutMutation } from "@/graphql/generated/schema";

export default function Header() {
  const { user, loading } = useAuth();
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
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
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-sm self-center mr-2">
                    Bonjour, {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm"
                  >
                    Déconnexion
                  </button>
                  <Link href="/admin/tags" className="btn btn-outline btn-sm">
                    Admin Tags
                  </Link>
                  <Link href="/admin/categories" className="btn btn-outline btn-sm">
                    Admin Catégories
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup" className="btn btn-outline btn-sm">
                    S'inscrire
                  </Link>
                  <Link href="/login" className="btn btn-outline btn-sm">
                    Se connecter
                  </Link>
                  <Link href="/admin/tags" className="btn btn-outline btn-sm">
                    Admin Tags
                  </Link>
                  <Link href="/admin/categories" className="btn btn-outline btn-sm">
                    Admin Catégories
                  </Link>
                </>
              )}
              <Link href="/newAd" className="btn btn-primary">
                Publier
              </Link>
            </>
          )}
        </div>
      </div>

      <CategoriesNav />
    </header>
  );
}
