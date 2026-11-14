// delete-account (B6, AC, Google Play's account deletion rule): the signed-in user deletes their own
// account. Their files are removed from storage, then the auth user is deleted; every table cascades
// from it. A coach's clients keep their own data and plans (D42); coaching links end with them.
//
// Only ever acts on the caller's own id, taken from their verified session, never from the body.
import { asCaller, asService, cors, reply } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });

  const { data } = await asCaller(auth).auth.getUser();
  const id = data?.user?.id;
  if (!id) return reply(401, { error: "signed_out" });

  const db = asService();
  // Files: athlete-files/<id>/<area>/<file>.
  const bucket = db.storage.from("athlete-files");
  const { data: areas } = await bucket.list(id, { limit: 100 });
  for (const area of areas ?? []) {
    const { data: files } = await bucket.list(`${id}/${area.name}`, { limit: 1000 });
    const paths = (files ?? []).map((f) => `${id}/${area.name}/${f.name}`);
    if (paths.length) await bucket.remove(paths);
  }

  const { error } = await db.auth.admin.deleteUser(id);
  if (error) {
    console.error("delete-account: failed", error.status ?? "error");
    return reply(500, { error: "server" });
  }
  return reply(200, { ok: true });
});
