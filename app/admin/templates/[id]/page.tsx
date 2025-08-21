import { prisma } from "@/lib/prisma";
import TemplateEditForm from "@/components/TemplateEditForm";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const t = await prisma.eventTemplate.findUnique({ where: { id: params.id } });
  if (!t) return <main style={{ padding: 24 }}>Template not found</main>;

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Edit Template</h1>
      <TemplateEditForm template={{
        id: t.id,
        name: t.name,
        title: t.title,
        description: t.description,
        venueName: t.venueName,
        venueCode: t.venueCode as any,
        address: t.address,
        mapUrl: t.mapUrl,
        waPhone: t.waPhone,
        coverImage: t.coverImage,
        capacity: t.capacity,
      }} />
    </main>
  );
}
