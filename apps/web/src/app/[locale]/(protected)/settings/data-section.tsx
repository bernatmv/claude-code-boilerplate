"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteAccount, exportUserData } from "./actions";

export function DataSection() {
  const [pendingExport, startExport] = useTransition();
  const [pendingDelete, startDelete] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const onExport = () => {
    setMessage(null);
    startExport(async () => {
      const r = await exportUserData();
      if (!r.ok) {
        setMessage(r.message);
        return;
      }
      const blob = new Blob([r.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  const onDelete = () => {
    const typed = window.prompt(
      'This will permanently delete your account and all associated data. Type "delete" to confirm.',
    );
    if (typed !== "delete") return;
    setMessage(null);
    startDelete(async () => {
      const r = await deleteAccount();
      if (!r.ok) setMessage(r.message);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Export your data</span>
        <Button onClick={onExport} disabled={pendingExport}>
          {pendingExport ? "Preparing…" : "Download JSON"}
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-red-700">Delete account</span>
        <Button variant="destructive" onClick={onDelete} disabled={pendingDelete}>
          {pendingDelete ? "Deleting…" : "Delete account"}
        </Button>
      </div>
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
