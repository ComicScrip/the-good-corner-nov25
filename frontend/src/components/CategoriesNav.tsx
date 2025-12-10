import { useRouter } from "next/router";
import { useCategoriesQuery } from "@/graphql/generated/schema";
import Loader from "./Loader";

export default function CategoriesNav() {
  const router = useRouter();

  const { data, loading } = useCategoriesQuery();
  const categories = data?.categories || [];

  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(window.location.search);
    const isActive = router.query.categoryId === categoryId.toString();

    if (!isActive) {
      params.set("categoryId", categoryId.toString());
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <nav className="flex carousel-horizontal max-w-[100vw] h-[40px]">
      {loading && <Loader />}
      {categories.map((cat) => {
        const [firstLetter, ...restOfCatName] = cat.name.split("");
        const catName = firstLetter.toUpperCase() + restOfCatName.join("");
        const isActive = router.query.categoryId === cat.id.toString();

        return (
          <button
            type="button"
            className={`p-2 rounded-lg cursor-pointer ${
              isActive ? "bg-orange-600 text-white" : ""
            }`}
            onClick={() => handleCategoryClick(cat.id)}
            key={cat.id}
          >
            {catName}
          </button>
        );
      })}
    </nav>
  );
}
