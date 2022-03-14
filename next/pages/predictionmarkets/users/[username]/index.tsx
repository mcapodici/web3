import type { NextPage } from "next";
import { RequireWeb3Wrapper, Web3Props } from "sitewide/RequireWeb3Wrapper";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  calculateNumbeOfSharesForMarket,
  getMarket,
  getUserInfo,
  getUserProfileForUserName,
  IMarketInfo,
  makeBet,
  UserInfo,
  UserProfile,
} from "ethereum/contracts/PredictionMarket";
import PredictionMarketsLayout from "predictionmarkets/PredictionMarketsLayout";
import { Button, Form, Input, Table } from "semantic-ui-react";
import { BNToken } from "util/BN";
import { ResolveModal } from "predictionmarkets/ResolveModal";
import useWindowDimensions from "util/Hooks";
import Market from "predictionmarkets/Market";
import useWeb3Action from "sitewide/hooks/useWeb3Action";

const Index: NextPage<Web3Props> = ({ web3Ref, firstAccount }: Web3Props) => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const funds = userInfo?.balance || BNToken.fromNumTokens("0");
  const r = useRouter();
  const userName = r.query.username as string;

  useEffect(() => {
    getUserProfileForUserName(web3Ref.current, userName).then(setUserProfile);
  }, [web3Ref, userName]);


  useEffect(() => {
    getUserInfo(web3Ref.current, firstAccount).then(setUserInfo);
  }, [web3Ref, firstAccount]);
  return (
    <PredictionMarketsLayout
      username={userInfo?.username || "Unregistered Visitor"}
      funds={funds}
    >
      {userProfile ? JSON.stringify(userProfile) : <p>No user with this name exists</p>}
    </PredictionMarketsLayout>
  );

  // const windowDimensions = useWindowDimensions();
  // const [market, setMarket] = useState<IMarketInfo>();
  // const [betAmount, setBetAmount] = useState("2");
  // const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  // const [showResolveModal, setShowResolveModal] = useState(false);
  // const web3Action = useWeb3Action();

  // const r = useRouter();
  // const marketaddress = r.query.account as string;
  // const marketindex = Number(r.query.index);
  // const betFormErrorMessage = false;

  // const intPattern = /^[0-9]+$/;

  // const betAmountNumber = intPattern.test(betAmount)
  //   ? new Number(betAmount)
  //   : 0;
  // const funds = userInfo?.balance || BNToken.fromNumTokens("0");
  // const isRegistered = !!userInfo?.username;
  // const betAmountError =
  //   betAmountNumber < 2 || betAmountNumber > Number(funds.toNumTokens());

  // const placeBet = async (yes: boolean) => {
  //   const betTokens = BNToken.fromNumTokens(betAmount);

  //   const numberOfShares = await calculateNumbeOfSharesForMarket(
  //     web3Ref.current,
  //     marketaddress,
  //     marketindex,
  //     betTokens,
  //     yes
  //   );

  //   const success = await web3Action(
  //     "Your bet is being placed.",
  //     "Placing Bet",
  //     () =>
  //       makeBet(
  //         web3Ref.current,
  //         firstAccount,
  //         marketaddress,
  //         marketindex,
  //         numberOfShares.asSand(),
  //         yes
  //       )
  //   );

  //   if (success) {
  //     getMarket(web3Ref.current, marketaddress, marketindex).then(setMarket);
  //   }
  // };

  // useEffect(() => {
  //   getMarket(web3Ref.current, marketaddress, marketindex).then(setMarket);
  // }, [web3Ref, marketaddress, marketindex]);

  // useEffect(() => {
  //   getUserInfo(web3Ref.current, firstAccount).then(setUserInfo);
  // }, [web3Ref, firstAccount]);

  // const [yesText, noText, dpForWidth] = windowDimensions.isNarrow
  //   ? ["Y", "N", 2]
  //   : ["YES", "NO", 4];

  // return (
  //   <PredictionMarketsLayout
  //     username={userInfo?.username || "Unregistered Visitor"}
  //     funds={funds}
  //   >
  //     {market ? (
  //       <>
  //         <h1>Market</h1>
  //         <Market
  //           market={market}
  //           onResolveClick={() => setShowResolveModal(true)}
  //           showResolveButton={
  //             !market.resolved && market.useraddress === firstAccount
  //           }
  //           forNarrowWidth={windowDimensions.isNarrow}
  //         />
  //         <h2>Bets</h2>
  //         <Table unstackable>
  //           <Table.Header>
  //             <Table.HeaderCell>User</Table.HeaderCell>
  //             <Table.HeaderCell>Outcome</Table.HeaderCell>
  //             <Table.HeaderCell>Bet</Table.HeaderCell>
  //             <Table.HeaderCell>Shares</Table.HeaderCell>
  //             <Table.HeaderCell>Payout</Table.HeaderCell>
  //           </Table.Header>
  //           <Table.Row>
  //             <Table.Cell>{market.username}</Table.Cell>
  //             <Table.Cell>
  //               {windowDimensions.isNarrow ? "" : "ANTE - "}
  //               {yesText}
  //             </Table.Cell>
  //             <Table.Cell>{market.ante1.toNumTokens(0)}</Table.Cell>
  //             <Table.Cell>
  //               {market.anteShares1.toNumTokens(dpForWidth)}
  //             </Table.Cell>
  //             <Table.Cell>{market.antePayout1.toNumTokens(0)}</Table.Cell>
  //           </Table.Row>
  //           <Table.Row>
  //             <Table.Cell>{market.username}</Table.Cell>
  //             <Table.Cell>
  //               {windowDimensions.isNarrow ? "" : "ANTE - "}
  //               {noText}
  //             </Table.Cell>
  //             <Table.Cell>{market.ante0.toNumTokens(0)}</Table.Cell>
  //             <Table.Cell>
  //               {market.anteShares0.toNumTokens(dpForWidth)}
  //             </Table.Cell>
  //             <Table.Cell>{market.antePayout0.toNumTokens(0)}</Table.Cell>
  //           </Table.Row>
  //           {market.bets.map((b, i) => (
  //             <Table.Row key={i}>
  //               <Table.Cell>{b.username}</Table.Cell>
  //               <Table.Cell>
  //                 {b.outcome.toString() == "1" ? yesText : noText}
  //               </Table.Cell>
  //               <Table.Cell>{b.betsize.toNumTokens(0)}</Table.Cell>
  //               <Table.Cell>
  //                 {b.numberOfShares.toNumTokens(dpForWidth)}
  //               </Table.Cell>
  //               <Table.Cell>{b.currentPayoutIfWin.toNumTokens(0)}</Table.Cell>
  //             </Table.Row>
  //           ))}
  //         </Table>
  //         <h2>Place your bet</h2>
  //         <p>The minimum bet size is 2</p>
  //         {isRegistered ? (
  //           <Form error={!!betFormErrorMessage}>
  //             <Form.Field error={betAmountError}>
  //               <Input
  //                 fluid
  //                 label="P$"
  //                 labelPosition="left"
  //                 value={betAmount}
  //                 onChange={(event) => setBetAmount(event.target.value)}
  //                 action={
  //                   <>
  //                     <Button
  //                       style={{ marginLeft: "5px", marginRight: "5px" }}
  //                       color="green"
  //                       onClick={() => placeBet(true)}
  //                     >
  //                       Bet YES
  //                     </Button>
  //                     <Button color="pink" onClick={() => placeBet(false)}>
  //                       Bet NO
  //                     </Button>
  //                   </>
  //                 }
  //               ></Input>
  //             </Form.Field>
  //           </Form>
  //         ) : (
  //           <p>Register to bet</p>
  //         )}
  //         {showResolveModal && (
  //           <ResolveModal
  //             onClose={() => setShowResolveModal(false)}
  //             onResolved={() => {
  //               getMarket(web3Ref.current, marketaddress, marketindex).then(
  //                 setMarket
  //               );
  //             }}
  //             marketIndex={marketindex}
  //             web3Ref={web3Ref}
  //             firstAccount={firstAccount}
  //           />
  //         )}{" "}
  //       </>
  //     ) : (
  //       <p>Loading...</p>
  //     )}
  //   </PredictionMarketsLayout>
  // );
};
export default RequireWeb3Wrapper(Index, () => <></>);
