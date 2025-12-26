import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useLogoutMutation, useProfileQuery } from "@/graphql/generated/schema";
import CategoriesNav from "./CategoriesNav";
import SearchInput from "./SearchInput";

export default function Header() {
  const { data, loading, refetch } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const user = data?.me || null;
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      await refetch();
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getUserInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };
  return (
    <header className="p-4 border-b border-gray-400 flex flex-col w-full gap-4">
      {/* Small screen layout: Title + Burger menu */}
      <div className="flex flex-row justify-between items-center xl:hidden">
        <Link href="/" className="w-max">
          <h1 className="text-orange-600 text-2xl font-bold">The good corner</h1>
        </Link>

        <div className="flex items-center gap-2">
          {!loading && user && (
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getUserInitial(user.email)}
            </div>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-ghost btn-sm"
            aria-label="Menu"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>menu</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white p-4 space-y-2">
          {!loading &&
            (user ? (
              <div className="space-y-2">
                <Link
                  href="/newAd"
                  className="btn btn-primary w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publier
                </Link>
                <button type="button" className="btn btn-outline w-full" onClick={handleLogout}>
                  Déconnexion
                </button>
                <Link
                  href="/admin/tags"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Tags
                </Link>
                <Link
                  href="/admin/categories"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Catégories
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/newAd"
                  className="btn btn-primary w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publier
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/admin/tags"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Tags
                </Link>
                <Link
                  href="/admin/categories"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Catégories
                </Link>
              </div>
            ))}
        </div>
      )}

      {/* Small screen search: below title and publish */}
      <div className="xl:hidden -mx-4 px-4">
        <SearchInput noInputClass className="w-full" inputClassName="w-full" />
      </div>

      {/* Large screen layout: Title + Search + Publish button */}
      <div className="hidden xl:flex xl:flex-row xl:justify-between xl:items-center">
        <div className="flex flex-row items-center gap-4">
          <Link href="/" className="w-max">
            <h1 className="text-orange-600 text-2xl font-bold">The good corner</h1>
          </Link>

          <SearchInput inputClassName="w-sm" />
        </div>

        <div className="flex gap-2 items-center">
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="flex items-center gap-2 mr-2">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {getUserInitial(user.email)}
                    </div>
                  </div>
                  <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
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
