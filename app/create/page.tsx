"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { create_request } from "../apiCall";

// zod validation
const uomSchema = z.object({
uomCode: z
.string()
.trim()
.min(1, "UOM code is required")
.max(20, "UOM code cannot exceed 20 characters"),

uomName: z
    .string()
    .trim()
    .min(1, "UOM name is required")
    .max(100, "UOM name cannot exceed 100 characters"),

uomCategory: z
    .string()
    .trim()
    .min(1, "UOM category is required")
    .max(50, "UOM category cannot exceed 50 characters"),

decimalPlaces: z
    .number({
        error: "Decimal places must be a number",
    })
    .int("Decimal places must be a whole number")
    .min(0, "Decimal places cannot be negative")
    .max(10, "Decimal places cannot exceed 10"),

description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),

});

//  Infer the TypeScript type from the schema
type UOMFormData = z.infer<typeof uomSchema>;

export default function CreateUOM() {
const router = useRouter();
const [isSubmitting, setIsSubmitting] = useState(false);

// rhf - React Hook Form
const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<UOMFormData>({
    resolver: zodResolver(uomSchema),
    defaultValues: {
        uomCode: "",
        uomName: "",
        uomCategory: "",
        decimalPlaces: 0,
        description: "",
    },
    mode: "onBlur",
});

// handle form submission
const onSubmit = async (data: UOMFormData) => {
    if (isSubmitting) return;

    const token = localStorage.getItem("token");

    if (!token) {
        toast.error("Access token not found. Please log in.");
        return;
    }

    setIsSubmitting(true);

    try {
        const res = await create_request(
            data.uomCode,
            data.uomName,
            data.uomCategory,
            data.decimalPlaces.toString(),
            data.description,
            token
        );

        if (res) {
            toast.success("UOM created successfully");
            router.push("/master");
        } else {
            toast.error("Could not create UOM");
        }
    } catch (error) {
        console.error("Failed to create UOM:", error);
        toast.error("An unexpected error occurred while creating UOM.");
    } finally {
        setIsSubmitting(false);
    }
};



const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const errorClass = "mt-1 text-sm text-red-600";

return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <a
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            href="/master"
        >
            ← Back to UOM Master
        </a>

        <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
                    UOM Master
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Create a unit of measure
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Enter the details for the new UOM record.
                </p>
            </div>

            <form
                className="grid gap-5 sm:grid-cols-2"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                {/* UOM Code */}
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    UOM code

                    <input
                        {...register("uomCode")}
                        className={inputClass}
                        placeholder="e.g. KG"
                        aria-invalid={!!errors.uomCode}
                    />

                    {errors.uomCode && (
                        <p className={errorClass}>
                            {errors.uomCode.message}
                        </p>
                    )}
                </label>

                {/* UOM Name */}
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    UOM name

                    <input
                        {...register("uomName")}
                        className={inputClass}
                        placeholder="e.g. Kilogram"
                        aria-invalid={!!errors.uomName}
                    />

                    {errors.uomName && (
                        <p className={errorClass}>

                            {errors.uomName.message}
                        </p>
                    )}
                </label>

                {/* UOM Category */}
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    UOM category

                    <input
                        {...register("uomCategory")}
                        className={inputClass}
                        placeholder="e.g. Weight"
                        aria-invalid={!!errors.uomCategory}
                    />

                    {errors.uomCategory && (
                        <p className={errorClass}>
                            {errors.uomCategory.message}
                        </p>
                    )}
                </label>

                {/* Decimal Places */}
                <label className="space-y-2 text-sm font-medium text-slate-700">
                    Decimal places

                    <input
                        {...register("decimalPlaces", {
                            valueAsNumber: true,
                        })}
                        className={inputClass}
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        aria-invalid={!!errors.decimalPlaces}
                    />

                    {errors.decimalPlaces && (
                        <p className={errorClass}>
                            {errors.decimalPlaces.message}
                        </p>
                    )}
                </label>

                {/* Description */}
                <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    Description

                    <textarea
                        {...register("description")}
                        className={inputClass}
                        rows={3}
                        placeholder="Enter an optional description"
                        aria-invalid={!!errors.description}
                    />

                    {errors.description && (
                        <p className={errorClass}>
                            {errors.description.message}
                        </p>
                    )}
                </label>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                    <button
                        className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                        type="button"
                        onClick={() => router.push("/master")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>

                    <button
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create UOM"}
                    </button>
                </div>
            </form>
        </section>
    </main>
);



}
