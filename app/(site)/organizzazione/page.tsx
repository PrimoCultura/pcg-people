import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { OrganizationPageClient } from "@/components/organization/OrganizationPageClient";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Organizzazione",
};

export default function OrganizzazionePage() {
  return (
    <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
      <Container>
        <PageIntro
          eyebrow="Organizzazione"
          title="Come siamo organizzati"
          description="Esplora la struttura di PCG, scopri i team e trova rapidamente le persone che ne fanno parte."
        />
        <OrganizationPageClient />
      </Container>
    </section>
  );
}
