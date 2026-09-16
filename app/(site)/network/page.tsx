import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NetworkPageClient } from "@/components/network/NetworkPageClient";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Network",
};

export default function NetworkPage() {
  return (
    <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
      <Container>
        <PageIntro
          eyebrow="Rete"
          title="Network"
          description="Esplora la struttura territoriale di PCG e trova Area Manager e cliniche."
        />
        <NetworkPageClient />
      </Container>
    </section>
  );
}
