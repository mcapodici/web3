import { create } from "ipfs-http-client";
import * as siteWideData from "sitewide/SiteWideData.json";
import { CID } from "multiformats/cid";

export async function addText(text: string) {
  try {
    const client = create(siteWideData.ipfsApi);
    const added = await client.add(text);
    return CID.parse(added.path);
  } catch (ex: any) {
    throw new IPFSError(ex.message);
  }
}

export async function fetchText(cid: CID) {
  try {
    const res = await fetch(
      siteWideData.ipfsGetTemplate.replace("{0}", cid.toV1().toString())
    );
    return await res.text();
  } catch (ex) {
    return undefined;
  }
}

export class IPFSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IPFSError";
  }
}

export const contractMultiHashToCID = (m: string) => {
  const mutlihashBytes = Uint8Array.from(Buffer.from(m.substring(2), "hex"));
  const headerBytes = Uint8Array.from([0x12, 0x20]);
  const bytes = new Uint8Array(34);
  bytes.set(headerBytes);
  bytes.set(mutlihashBytes, 2);
  return CID.decode(bytes);
};

export const getMultihashForContract = (cid: CID) =>
  "0x" + Buffer.from(cid.multihash.digest).toString("hex");
