// The private `athlete-files` bucket is laid out as <user id>/<area>/<file>. Files are removed through
// the Storage API (deleting storage rows directly would leave the files behind).
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const BUCKET = "athlete-files";
const PAGE = 1000;

/** Every name in one folder, page by page. */
async function listAll(db: SupabaseClient, folder: string) {
  const names: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await db.storage.from(BUCKET).list(folder, { limit: PAGE, offset });
    if (error || !data?.length) break;
    names.push(...data.map((f) => f.name));
    if (data.length < PAGE) break;
  }
  return names;
}

/** Removes every file a user has. Returns how many were removed. */
export async function removeUserFiles(db: SupabaseClient, id: string) {
  let removed = 0;
  for (const area of await listAll(db, id)) {
    const paths = (await listAll(db, `${id}/${area}`)).map((f) => `${id}/${area}/${f}`);
    for (let i = 0; i < paths.length; i += PAGE) {
      const { data } = await db.storage.from(BUCKET).remove(paths.slice(i, i + PAGE));
      removed += data?.length ?? 0;
    }
  }
  return removed;
}

/** The user folders at the top of the bucket. */
export const userFolders = (db: SupabaseClient) => listAll(db, "");
