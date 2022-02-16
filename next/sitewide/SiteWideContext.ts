import React from "react";


export interface SiteWideContextObject {
  addressLinkTemplate: string;
}

export const SiteWideContext = React.createContext<SiteWideContextObject>({
  addressLinkTemplate: ''
});