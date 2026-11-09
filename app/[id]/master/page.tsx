"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { delete_request, get_data } from "../../apiCall";
import { toast } from "sonner";

interface UOM {
  uom_id: number;
  uom_name: string;
  uom_code: string;
  description?: string;
  active: boolean
}

const deleteSchema = z.object({
  confirmation: z.string().trim().min(1, "Enter the UOM name to confirm deletion"),
});

type DeleteFormData = z.infer<typeof deleteSchema>;

export default function MasterPage() {
  const [dataList, setDataList] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UOM | null>(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<DeleteFormData>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { confirmation: "" },
  });

  const nav_create = () => {
    router.push("/create")
  }

 const nav_update = (uom_id: number) => {
  router.push(`/${uom_id}/update`);
};

  const deleteUom = async (uom_id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Access token not found. Please log in.");
      router.push("/");
      return;
    }

    setDeletingId(uom_id);
    const deleted = await delete_request(uom_id, token);
    setDeletingId(null);

    if (deleted) {
      setDataList((current) => current.filter((item) => item.uom_id !== uom_id));
      setPendingDelete(null);
      toast.success("UOM deleted successfully");
    } else {
      toast.error("Could not delete UOM. Please try again.");
    }
  };

  const confirmDelete = async ({ confirmation }: DeleteFormData) => {
    if (!pendingDelete) return;
    if (confirmation !== pendingDelete.uom_name.trim()) {
      setFormError("confirmation", { message: "The name does not match this UOM." });
      return;
    }
    await deleteUom(pendingDelete.uom_id);
  };

  const openDeleteDialog = (item: UOM) => {
    reset({ confirmation: "" });
    setPendingDelete(item);
  };

  const closeDeleteDialog = () => {
    setPendingDelete(null);
    reset({ confirmation: "" });
  };

    const logout = () => {
        localStorage.removeItem("token")
        router.push("/")
    }
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        setError("Access token not found. Please log in.");
        setLoading(false);
        router.push("/");
        return;
      }

      try {
        const response = await get_data(accessToken);

        if (response === null) {
          setError("Failed to fetch UOM data.");
          return;
        }

        const records = Array.isArray(response)
          ? response
          : response.data;

        if (Array.isArray(records)) {
          setDataList(records);
        } else {
          setError("Unexpected API response format.");
          console.error("API response:", response);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">ERP workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">UOM Master</h1>
          <p className="mt-2 text-slate-500">Manage units of measure and their status.</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200" type="button" onClick={nav_create}>Create UOM</button>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={logout}>Log out</button>
        </div>
      </header>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <div className="p-8 text-sm text-slate-500">Loading UOM data...</div>}
        {!loading && error && <div className="m-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">UOM ID</th>
                  <th className="px-5 py-4 font-semibold">UOM Name</th>
                  <th className="px-5 py-4 font-semibold">UOM Code</th>
                  <th className="px-5 py-4 font-semibold">Description</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                  <th className="px-5 py-4 font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataList.length > 0 ? dataList.map((item) => (
                  <tr className="transition hover:bg-slate-50" key={item.uom_id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">{item.uom_id}</td>
                    <td className="px-5 py-4 text-slate-700">{item.uom_name}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{item.uom_code}</td>
                    <td className="max-w-sm truncate px-5 py-4 text-slate-500">{item.description ?? "-"}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.active ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4"><button className="font-semibold text-indigo-600 hover:text-indigo-800" type="button" onClick={() => nav_update(item.uom_id)}>Edit</button></td>
                    <td className="px-5 py-4"><button className="font-semibold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={deletingId === item.uom_id} onClick={() => openDeleteDialog(item)}>{deletingId === item.uom_id ? "Deleting..." : "Delete"}</button></td>
                  </tr>
                )) : (
                  <tr><td className="px-5 py-12 text-center text-slate-500" colSpan={7}>No UOM records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation">
          <section
            aria-labelledby="delete-dialog-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <h2 className="text-lg font-semibold text-slate-900" id="delete-dialog-title">Delete this UOM?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Delete “{pendingDelete.uom_name}” (ID: {pendingDelete.uom_id})? This cannot be undone. Enter the UOM name to confirm.
            </p>
            <form className="mt-4" onSubmit={handleSubmit(confirmDelete)} noValidate>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                UOM name
                <input
                  {...register("confirmation")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                  aria-invalid={!!errors.confirmation}
                  aria-describedby={errors.confirmation ? "delete-confirmation-error" : undefined}
                  autoFocus
                />
              </label>
              {errors.confirmation && <p className="mt-1 text-sm text-rose-600" id="delete-confirmation-error" role="alert">{errors.confirmation.message}</p>}
              <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={deletingId !== null || isSubmitting}
                onClick={closeDeleteDialog}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
                disabled={deletingId !== null || isSubmitting}
                type="submit"
              >
                {deletingId === pendingDelete.uom_id || isSubmitting ? "Deleting..." : "Delete UOM"}
              </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
