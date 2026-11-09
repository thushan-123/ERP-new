"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { get_data, update_request } from "../../apiCall";

interface UOM {
  uom_id: number;
  uom_code: string;
  uom_name: string;
  uom_category: string;
  decimal_places: number;
  description?: string | null;
  active: boolean;
}

interface UpdateUomProps {
  id: string;
}

const uomSchema = z.object({
  uomCode: z.string().trim().min(1, "UOM code is required").max(20, "UOM code cannot exceed 20 characters"),
  uomName: z.string().trim().min(1, "UOM name is required").max(100, "UOM name cannot exceed 100 characters"),
  uomCategory: z.string().trim().min(1, "UOM category is required").max(50, "UOM category cannot exceed 50 characters"),
  decimalPlaces: z.number({ error: "Decimal places must be a number" })
    .int("Decimal places must be a whole number")
    .min(0, "Decimal places cannot be negative")
    .max(10, "Decimal places cannot exceed 10"),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters"),
  active: z.boolean(),
});

type UOMFormData = z.infer<typeof uomSchema>;

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
const errorClass = "mt-1 text-sm text-red-600";

export default function UpdateUom({ id }: UpdateUomProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UOMFormData>({
    resolver: zodResolver(uomSchema),
    defaultValues: {
      uomCode: "",
      uomName: "",
      uomCategory: "",
      decimalPlaces: 0,
      description: "",
      active: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    let cancelled = false;

    const loadUom = async () => {
      const uomId = Number(id);
      if (!Number.isInteger(uomId) || uomId <= 0) {
        setLoadError("Invalid UOM ID.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setLoadError("Access token not found. Please log in.");
        setLoading(false);
        router.push("/");
        return;
      }

      try {
        const response = await get_data(token);
        const records = Array.isArray(response) ? response : response?.data;
        const item = Array.isArray(records)
          ? (records as UOM[]).find((record) => record.uom_id === uomId)
          : undefined;

        if (!item) {
          if (!cancelled) setLoadError("UOM record not found.");
          return;
        }

        if (!cancelled) {
          reset({
            uomCode: item.uom_code ?? "",
            uomName: item.uom_name ?? "",
            uomCategory: item.uom_category ?? "",
            decimalPlaces: item.decimal_places ?? 0,
            description: item.description ?? "",
            active: item.active ?? true,
          });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setLoadError("Could not load this UOM record.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadUom();
    return () => { cancelled = true; };
  }, [id, reset, router]);

  const onSubmit = async (data: UOMFormData) => {
    const uomId = Number(id);
    if (!Number.isInteger(uomId) || uomId <= 0) {
      toast.error("Invalid UOM ID");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Access token not found. Please log in.");
      return;
    }

    try {
      const res = await update_request(
        uomId,
        data.uomCode,
        data.uomName,
        data.uomCategory,
        String(data.decimalPlaces),
        data.description,
        token,
        data.active,
      );

      if (res) {
        toast.success("UOM updated successfully");
        router.push("/master");
      } else {
        toast.error("Could not update UOM");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <a className="text-sm font-medium text-indigo-600 hover:text-indigo-800" href="/master">← Back to UOM Master</a>
      <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">UOM Master</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Update unit of measure <span className="text-slate-400">#{id}</span></h1>
          <p className="mt-2 text-sm text-slate-500">Edit the record details below.</p>
        </div>
        {loading && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500" role="status">Loading current values...</p>}
        {!loading && loadError && <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{loadError}</p>}
        {!loading && !loadError && (
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="space-y-2 text-sm font-medium text-slate-700">UOM code
              <input {...register("uomCode")} className={inputClass} aria-invalid={!!errors.uomCode} />
              {errors.uomCode && <p className={errorClass}>{errors.uomCode.message}</p>}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">UOM name
              <input {...register("uomName")} className={inputClass} aria-invalid={!!errors.uomName} />
              {errors.uomName && <p className={errorClass}>{errors.uomName.message}</p>}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">UOM category
              <input {...register("uomCategory")} className={inputClass} aria-invalid={!!errors.uomCategory} />
              {errors.uomCategory && <p className={errorClass}>{errors.uomCategory.message}</p>}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Decimal places
              <input {...register("decimalPlaces", { valueAsNumber: true })} className={inputClass} type="number" min="0" max="10" step="1" aria-invalid={!!errors.decimalPlaces} />
              {errors.decimalPlaces && <p className={errorClass}>{errors.decimalPlaces.message}</p>}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">Description
              <textarea {...register("description")} className={inputClass} rows={3} aria-invalid={!!errors.description} />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:col-span-2">
              <input {...register("active")} className="size-4 rounded border-slate-300 accent-indigo-600" type="checkbox" />
              Active
            </label>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <button className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => router.push("/master")}>Cancel</button>
              <button className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
