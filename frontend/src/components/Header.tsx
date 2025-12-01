import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header() {
  return (
    <header className="p-4">
      <h1>
        <Link href="/" className="">
          <span className="text-2xl text-amber-600 bold">THE GOOD CORNER</span>
        </Link>
      </h1>
    </header>
  );
}