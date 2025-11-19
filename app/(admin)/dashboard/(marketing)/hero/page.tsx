import { getAllHeroBanners } from "@/lib/data/hero-banner";
import HeroBannersClientPage from "./_components/client-page";
import { getAllCollections } from "@/lib/actions/collections";

export default async function HeroBannersPage() {
  const banners = await getAllHeroBanners();
  const collections = await getAllCollections();

  return (
    <HeroBannersClientPage initialBanners={banners} collections={collections} />
  );
}
