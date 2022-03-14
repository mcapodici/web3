import { useContext } from "react";
import { AlertType } from "sitewide/alerts/AlertPanel";
import { Context } from "sitewide/Context";

let id = 0;

const useWeb3Action = () => {
  const context = useContext(Context);
  const start = async (
    pendingMessageContent: string,
    pendingMessageHeader: string,
    action: () => Promise<void>
  ) => {
    const pendingMessageContentWithExtra = pendingMessageContent +
       " Please follow the steps shown by your Ethereum provider, and then wait for the transaction to confirm which can take up to 30 seconds."
    const thisId = id;
    let success = false;
    try {
      context.dismissAlert("predictionmarket.web3action.success");
      context.dismissAlert("predictionmarket.web3action.fail");
      id++;
      context.addAlert({
        content: pendingMessageContentWithExtra,
        header: pendingMessageHeader,
        type: AlertType.Negative,
        uniqueId: thisId.toString(),
        dismissable: false,
        loading: true,
      });
      await action();
      success = true;
      context.addAlert({
        content: "Transaction Success",
        header: pendingMessageHeader + " success",
        type: AlertType.Positive,
        uniqueId: "predictionmarket.web3action.success",
        dismissable: true,
        loading: false,
      });
    } catch (ex: any) {
      context.addAlert({
        content: "Error details: " + ex?.message,
        header: pendingMessageHeader + " error occurred",
        type: AlertType.Negative,
        uniqueId: "predictionmarket.web3action.fail",
        dismissable: true,
        loading: false,
      });
    }
    context.dismissAlert(thisId.toString());
    return success;
  };

  return start;
};

export default useWeb3Action;
