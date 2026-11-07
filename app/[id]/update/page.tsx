import { Suspense } from "react";
import UpdateUom from "./UpdateUom";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading update form...</div></main>}>
      <UpdatePage params={params} />
    </Suspense>
  );
}

async function UpdatePage({ params }: PageProps) {
  const { id } = await params;

  return <UpdateUom id={id} />;
}
