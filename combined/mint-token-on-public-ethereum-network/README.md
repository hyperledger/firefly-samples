# Mint Token on Polygon Testnet

This sample contains a node.js application that demonstrates minting ERC20 tokens using FireFly on a public ethereum based blockchain network when some specific events are detected.

The core logic to achieve the sample is [here](https://github.com/kaleido-io/firefly-samples/blob/combined-sample/combined/mint-token-on-public-ethereum-network/src/firefly-client.ts?plain%3D1#L37-L69):
```
const firefly = new FireFly({ host: "http://localhost:5000" });
const sub: FireFlySubscriptionBase = {
  filter: {
    events: "token_transfer_confirmed", // filter on confirmed transfers only
  },
};
// example code for listening to an event using Firefly SDK
firefly.listen(sub, async (socket, event) => {
  // received a token transfer confirmed event
  // now we can do something
  // 1. let's figure out more information about this transfer
  const operations = await firefly.getOperations({
    tx: event.tx,
    type: "token_transfer",
  });
  if (operations.length > 0) {
    console.log(`Retrieved operation: ${JSON.stringify(operations[0].input)}`);
    // 2. if the transfer is made to our account address
    //    do a random thing, e.g. mint the same amount again if the transfer is a mint...
    if (
      operations[0].input?.to?.toLowerCase() === process.env.ACCOUNT_ADDRESS &&
      operations[0].input?.type === "mint"
    ) {
      console.log("Mint the same token again to get us into a loop");
      await firefly.mintTokens({
        amount: operations[0].input?.amount,
        idempotencyKey: operations[0].input?.localId,
        pool: operations[0].input?.pool,
      });
      totalMinted++;
    }
  }
});
```

## Setup

To run the application, you will need the following setup:
1. a local FireFly stack running in the gateway mode targeting the Polygon Testnet. Follow [this instruction](https://hyperledger.github.io/firefly/tutorials/chains/polygon_testnet.html#polygon-testnet) to set one up.
2. Configure the Firefly stack with a token pool.
   1. You can use the pre-deployed ERC20 smart contract address: `0x4C4706aDE858c1D182FBdD1A8A29353b7455b678`, which is set up to be mintable by any account. In this case, follow the steps from [Create a Token Pool](./sample-contract/README.md#create-a-token-pool) section.
   2. Or you can deploy your own smart contract of an ERC20 token following all the steps in [./sample-contract](./sample-contract).


## Running

Once the FireFly stack is ready, set up and run the sample with:

```
export ACCOUNT_ADDRESS=replace_with_the_account_address_of_your_local_stack
npm install
npm start
```
