import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DepartmentFocusPageClient } from "@/components/organization/departments/DepartmentFocusPageClient";

type PageProps = {
  params: Promise<{ departmentId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { departmentId } = await params;
  return {
    title: `Organigramma dipartimento`,
    description: `Vista organigramma del dipartimento ${departmentId}.`,
  };
}

export default async function DepartmentOrgFocusPage({ params }: PageProps) {
  const { departmentId } = await params;
  return (
    <section className="pb-14 pt-10 sm:pb-16 sm:pt-12">
      <Container>
        <DepartmentFocusPageClient departmentId={departmentId} />
      </Container>
    </section>
  );
}
