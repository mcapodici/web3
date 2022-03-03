import { create } from "ipfs-http-client";
import * as siteWideData from "sitewide/SiteWideData.json";
import { CID } from "multiformats/cid";

export async function addText(text: string) {
  try {
    const client = create(siteWideData.ipfs);
    const added = await client.add(text);
    return CID.parse(added.path);
  } catch (ex: any) {
    throw new IPFSError(ex.message);
  }
}

export class IPFSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IPFSError";
  }
}

export const getMultihashForContract = (cid: CID) =>
  "0x" + Buffer.from(cid.multihash.digest).toString("hex");
