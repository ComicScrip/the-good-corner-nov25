import Head from "next/head";
import Header from "@/components/Header";
import RecentAds from "@/components/RecentAds";

export default function Home() {
  return (
    <>
      <Head>
        <title>The good corner</title>
        <meta name="description" content="browse and publish ads" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <RecentAds />
    </>
  );
}