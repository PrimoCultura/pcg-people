import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DistrictDetailClient } from "@/components/network/DistrictDetailClient";

type PageProps = {
  params: Promise<{ districtId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Distretto" };
}

export default async function DistrictDetailPage(props: PageProps) {
  const { districtId } = await props.params;

  return (
    <section className="pb-14 pt-8 sm:pb-16 sm:pt-10">
      <Container>
        <DistrictDetailClient districtId={districtId} />
      </Container>
    </section>
  );
}
