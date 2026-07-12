import { removeDbFiles } from "./removeDbFiles";

export default async function globalTeardown() {
  await removeDbFiles();
}
