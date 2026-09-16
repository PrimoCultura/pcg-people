import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DepartmentDetailClient } from "@/components/departments/DepartmentDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dipartimento" };
}

export default async function DepartmentDetailPage(props: PageProps) {
  const { id } = await props.params;

  return (
    <section className="pb-14 pt-8 sm:pb-16 sm:pt-10">
      <Container>
        <DepartmentDetailClient id={id} />
      </Container>
    </section>
  );
}
