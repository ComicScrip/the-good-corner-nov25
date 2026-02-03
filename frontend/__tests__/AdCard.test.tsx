import AdCard from "@/components/AdCard";
import type { Ad } from "@/types";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

jest.mock("../src/components/FavoriteButton", () => {
  return function MockFavoriteButton() {
    return <div data-testid="fav-btn">FavoriteButton</div>;
  };
});

describe("AdCard", () => {
  const adStub: Ad = {
    id: 1,
    title: "test ad",
    pictureUrl: "https://example.com/img.jpg",
    price: 42,
  };

  it("renders all required elements", () => {
    const { container } = render(<AdCard ad={adStub} />);

    expect(container).toMatchInlineSnapshot(`
<div>
  <a
    class="w-[400px] cursor-pointer"
    href="/ads/1"
  >
    <div
      class="relative shadow-md border rounded-lg p-4 bg-white mr-3 mb-3"
    >
      <img
        alt="test ad"
        class="h-[200px] w-full object-cover rounded-md"
        src="https://example.com/img.jpg"
      />
      <div
        class="flex justify-between pt-6"
      >
        <div
          class="ad-card-title"
        >
          test ad
        </div>
        <div
          class="ad-card-price"
        >
          42,00 €
        </div>
      </div>
      <div
        class="absolute top-6 right-6"
      >
        <div
          data-testid="fav-btn"
        >
          FavoriteButton
        </div>
      </div>
    </div>
  </a>
</div>
`);
  });

  it("renders correcly when price is not well formated", () => {
    const { container } = render(<AdCard ad={{ ...adStub, price: 42.76856756575 }} />);

    expect(container).toMatchInlineSnapshot(`
<div>
  <a
    class="w-[400px] cursor-pointer"
    href="/ads/1"
  >
    <div
      class="relative shadow-md border rounded-lg p-4 bg-white mr-3 mb-3"
    >
      <img
        alt="test ad"
        class="h-[200px] w-full object-cover rounded-md"
        src="https://example.com/img.jpg"
      />
      <div
        class="flex justify-between pt-6"
      >
        <div
          class="ad-card-title"
        >
          test ad
        </div>
        <div
          class="ad-card-price"
        >
          42,77 €
        </div>
      </div>
      <div
        class="absolute top-6 right-6"
      >
        <div
          data-testid="fav-btn"
        >
          FavoriteButton
        </div>
      </div>
    </div>
  </a>
</div>
`);
  });
});
