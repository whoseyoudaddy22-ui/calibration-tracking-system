"use client";

import { useRef } from "react";

export function ConfirmSubmitButton({
  message,
  formAction,
  className,
  children,
}: {
  message: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(e) => {
          const form = e.currentTarget.form;
          if (form && !form.reportValidity()) return;
          dialogRef.current?.showModal();
        }}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        className="rounded-lg border border-gray-200 p-6 shadow-lg backdrop:bg-black/40"
      >
        <p className="mb-4 max-w-sm text-sm text-gray-700">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => dialogRef.current?.close()}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            formAction={formAction}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => dialogRef.current?.close()}
          >
            ยืนยัน
          </button>
        </div>
      </dialog>
    </>
  );
}
