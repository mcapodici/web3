import detectEthereumProvider from '@metamask/detect-provider';

let ethereumProvider: unknown = undefined;

export enum HasEthereumProviderStatus {
  Checking,
  Yes,
  No
}

/**
 * Attempts to find a EIP-1193 compatiable Ethereum provider.
 * 
 * @returns true if provider was successfully found, otherwise false.
 */
export async function init() {
  ethereumProvider = await detectEthereumProvider();
  return ethereumProvider ? HasEthereumProviderStatus.Yes : HasEthereumProviderStatus.No;
}

/**
 * Gets the provider found by previous call to init. Will be falsey if
 * either the init() async hasn't completed, or it has and no provider
 * was found.
 * 
 * @returns T
 */
export function getEthereumProvider() {
  return ethereumProvider;
}


export interface HasEthereumProviderProps {
  ethereumProviderStatus?: HasEthereumProviderStatus;
}