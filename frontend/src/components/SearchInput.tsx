import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface SearchInputProps {
  className?: string;
  inputClassName?: string;
}

export default function SearchInput({
  className = "",
  inputClassName = "w-full",
}: SearchInputProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const titleContains = params.get("titleContains") || "";
    setSearchValue(titleContains);
  }, [router.asPath]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = (formData.get("titleContains") as string) || "";
    const params = new URLSearchParams(window.location.search);
    params.set("titleContains", search);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <label className="input">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>search</title>
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          className={inputClassName}
          type="search"
          placeholder="Rechercher une annonce"
          name="titleContains"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </label>
    </form>
  );
}
