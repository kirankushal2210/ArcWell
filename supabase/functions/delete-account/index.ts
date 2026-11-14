// delete-account (B6, AC, Google Play's account deletion rule): the signed-in user deletes their own
// account. Their files are removed from storage, then the auth user is deleted; every table cascades
// from it. A coach's clients keep their own data and plans (D42); coaching links end with them.
//
// Only ever acts on the caller's own id, taken from their verified session, never from the body.
import { removeUserFiles } from "../_shared/files.ts";
import { asCaller, asService, cors, reply } from "../_shared/http.ts";

/** A few tries a day is plenty; more is a script (S-01). */
const DAILY_CAP = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });

  const me = asCaller(auth);
  const { data } = await me.auth.getUser();
  const id = data?.user?.id;
  if (!id) return reply(401, { error: "signed_out" });
  const { data: allowed } = await me.rpc("call_try_use", { p_fn: "delete_account", p_cap: DAILY_CAP });
  if (!allowed) return reply(429, { error: "rate_limited" });

  const db = asService();
  // Files: athlete-files/<id>/<area>/<file>.
  await removeUserFiles(db, id);

  const { error } = await db.auth.admin.deleteUser(id);
  if (error) {
    console.error("delete-account: failed", error.status ?? "error");
    return reply(500, { error: "server" });
  }
  return reply(200, { ok: true });
});
