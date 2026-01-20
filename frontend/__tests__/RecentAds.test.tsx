import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import RecentAds from "@/components/RecentAds";
import { RecentAdsDocument } from "@/graphql/generated/schema";

const recentAdsMock = {
  request: {
    query: RecentAdsDocument,
  },
  result: {
    data: {
      ads: [
        {
          id: 1,
          title: "test ad",
          pictureUrl: "https://example.com/img.jpg",
          price: 42,
        },
        {
          id: 2,
          title: "test ad 2",
          pictureUrl: "https://example.com/img2.jpg",
          price: 98,
        },
      ],
    },
  },
};

describe("RecentAds", () => {
  it("renders what is fetched on the API", async () => {
    render(
      <MockedProvider mocks={[recentAdsMock]}>
        <RecentAds />
      </MockedProvider>,
    );

    expect(await screen.findByText("Chargement...")).toBeInTheDocument();
    const [ad1, ad2] = recentAdsMock.result.data.ads;
    expect(await screen.findByText(ad1.title)).toBeInTheDocument();
    expect(await screen.findByText(ad2.title)).toBeInTheDocument();
  });
});
