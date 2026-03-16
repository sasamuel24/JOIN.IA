"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/services/userService";

export default function ProfileTestPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    getMe()
      .then(setData)
      .catch((e) => setErr(e?.message ?? String(e)));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile Test</h1>
      {err && <pre style={{ color: "red" }}>{err}</pre>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}