import { create } from "ipfs-http-client";
import * as siteWideData from "sitewide/SiteWideData.json";
import { CID } from "multiformats/cid";

export async function addText(text: string) {
  const client = create(siteWideData.ipfs);
  const added = await client.add(text);
  return CID.parse(added.path);
}

export const getMultihashForContract = (cid: CID) =>
  "0x" + Buffer.from(cid.multihash.digest).toString("hex");