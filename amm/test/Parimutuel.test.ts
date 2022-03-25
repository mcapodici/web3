import { expect } from "chai";
import { numberContext } from "../Interfaces";
import { parimutuel } from "../Parimutuel";

describe("parimutuel", () => {
  it("creates market correctly", () => {
    const pool = parimutuel.create(
      numberContext,
      ["1", "2", "3"],
      [0.5, 0.4, 0.1],
      100
    );

    expect(pool.probs()).deep.equal(
      [0.5, 0.4, 0.1],
      "math doesn't change probs"
    );
    expect(pool.canAddOutcome).to.be.false;
    expect(pool.canSellBet).to.be.false;
  });

  it("1 bet scenario", () => {
    const pool = parimutuel.create(
      numberContext,
      ["1", "2", "3"],
      [0.5, 0.4, 0.1],
      100
    );

    const bet = pool.bet({ player: "foo", outcomeIndex: 0, amount: 50 });

    expect(pool.probs()[0]).to.be.approximately(0.66, 0.01);
    expect(pool.probs()[1]).to.be.approximately(0.27, 0.01);
    expect(pool.probs()[2]).to.be.approximately(0.07, 0.01);
    expect(pool.betValue(bet).onSale).to.be.eq(0);
    expect(pool.betValue(bet).onWin).to.be.eq(75);
  });

  it("2 bet scenario", () => {
    const pool = parimutuel.create(
      numberContext,
      ["1", "2", "3"],
      [0.5, 0.4, 0.1],
      100
    );

    const bet = pool.bet({ player: "foo", outcomeIndex: 0, amount: 50 });
    const bet2 = pool.bet({ player: "bar", outcomeIndex: 1, amount: 100 });

    expect(pool.probs()[0]).to.be.eq(0.4);
    expect(pool.probs()[1]).to.be.eq(0.56);
    expect(pool.probs()[2]).to.be.eq(0.04);
    expect(pool.betValue(bet).onSale).to.be.eq(0);
    expect(pool.betValue(bet).onWin).to.be.eq(125);
    expect(pool.betValue(bet2).onSale).to.be.eq(0);
    expect(pool.betValue(bet2).onWin).to.be.approximately(178.57, 0.01);
  });

  it("2 bet scenario resolution", () => {
    const pool = parimutuel.create(
      numberContext,
      ["1", "2", "3"],
      [0.5, 0.4, 0.1],
      100
    );

    pool.bet({ player: "foo", outcomeIndex: 0, amount: 50 });
    pool.bet({ player: "bar", outcomeIndex: 1, amount: 100 });

    expect(pool.stats()).deep.eq([
      {
        name: "Pool Size - 1",
        value: 100,
      },
      {
        name: "Pool Size - 2",
        value: 140,
      },
      {
        name: "Pool Size - 3",
        value: 10,
      },
      {
        name: "Total Pool",
        value: 250,
      },
    ]);

    const result = pool.resolve([0]);

    expect(Object.keys(result).length).to.be.eq(1);
    expect(result["foo"]).to.be.eq(125);
  });
});
