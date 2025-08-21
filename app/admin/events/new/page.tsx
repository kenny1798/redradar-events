import AdminEventForm from "@/components/AdminEventForm";

export default function NewEventPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold tracking-wide">Create Event</h1>
      <p className="mt-2 text-sm text-slate-400">
        Use a <b>Location Template</b> to auto-fill <i>venue name / address / map URL</i>.  
        You can always adjust the details later.
      </p>

      <div className="mt-6">
        <AdminEventForm />
      </div>
    </main>
  );
}
