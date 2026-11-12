// App status (S-05, S-06): normally "ok". With the backend this comes from a remote config the app
// checks at start: a minimum version (force update) and a maintenance switch.
export type AppStatus = "ok" | "update" | "maintenance";
export const APP_STATUS: AppStatus = "ok";
