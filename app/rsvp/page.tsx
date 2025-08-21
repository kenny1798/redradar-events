// app/rsvp/page.tsx  (SERVER)
import RsvpForm from "./rsvp-form";

export default function RsvpPage({
  searchParams,
}: {
  searchParams?: { event?: string };
}) {
  const slug = searchParams?.event ?? "";
  return <RsvpForm slug={slug} />;
}
