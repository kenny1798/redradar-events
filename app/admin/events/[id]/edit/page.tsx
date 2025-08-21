import { prisma } from "@/lib/prisma";
import AdminEventEditForm from "@/components/AdminEventEditForm";
import Link from "next/link";

type PageProps = { params: { id: string } };

export default async function EditEventPage({ params }: PageProps) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      venueCode: true,
      venueName: true,
      address: true,
      mapUrl: true,
      waPhone: true,
      dateStart: true,
      dateEnd: true,
      coverImage: true,
      capacity: true,
      isPublished: true,
      slug: true,
    },
  });

  if (!event) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-slate-400">Event not found.</p>
        <Link href="/admin" className="text-cyan-400 hover:underline">← Back</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Event</h1>
        <Link href={`/admin`} className="text-sm text-cyan-400 hover:underline">
          ← Back to event
        </Link>
      </div>
      <AdminEventEditForm event={event} />
    </main>
  );
}
