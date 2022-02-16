import siteWideData from "sitewide/SiteWideData.json";

export default ({ address }: { address: string }) => {
  const { addressLinkTemplate } = siteWideData;

  return (
    <a target="_blank" href={addressLinkTemplate.replace("{address}", address)}>
      <span title={address}>
        {address.substr(0, 5)}...
        {address.substring(38)}
      </span>
    </a>
  );
};
