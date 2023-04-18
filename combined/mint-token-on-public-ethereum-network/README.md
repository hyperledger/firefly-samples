# Mint Token on Polygon Testnet

This sample includes a Node.js application that demonstrates how to mint more ERC20 tokens when a mint event is detected on a public Ethereum-based blockchain network. It demonstrates 2 key features of the [FireFly Node.js SDK](https://github.com/hyperledger/firefly-sdk-nodejs): subscribing to blockchain events, and submitting new blockchain transactions.

The core logic for this sample can be found [here](https://github.com/kaleido-io/firefly-samples/blob/combined-sample/combined/mint-token-on-public-ethereum-network/src/firefly-client.ts?plain%3D1#L37-L69):

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

The diagram below provides an overview of the steps required to set up a FireFly local stack that connects to the Polygon Testnet.

You will use both the [FireFly CLI](https://github.com/hyperledger/firefly-cli) and the [FireFly Sandbox UI](https://github.com/hyperledger/firefly-sandbox) to complete this process. Once you have completed the setup, you can run a sample Node.js application that will automatically mint tokens in a loop after you have manually minted a token using the Sandbox UI.

![sample-setup-overview.jpg](./sample-setup-overview.jpg)

## Setup

To run the application, you will need to have the following setup:

1. A local Firefly stack that is running in gateway mode and is targeting the Polygon Testnet. You can follow the instructions provided in [this tutorial](https://hyperledger.github.io/firefly/tutorials/chains/polygon_testnet.html#polygon-testnet) to set up the stack.
2. The Firefly stack needs to be configured with a token pool. You can read more about token pools [here](https://hyperledger.github.io/firefly/tutorials/tokens/#what-is-a-pool). They provide common set of functions to interact with different variants of smart contract token implementations. They also index the smart contract for a token, allowing you to subscribe to events relating to token transfers and query account balances.
   - For this sample there are two options available to create a FireFly token pool:
     - You can use the pre-deployed ERC20 smart contract address `0x4C4706aDE858c1D182FBdD1A8A29353b7455b678` on the Polygon Mumbai test net, which has been set up to be mintable by any account. If you choose this option, you should follow the steps outlined in the "Create a Token Pool" section of [the README.md file in the sample-contract directory](./sample-contract/README.md#create-a-token-pool).
     - Alternatively, you can deploy your own smart contract for an ERC20 token by following all the steps provided in the [./sample-contract](./sample-contract) directory.

## Running

Once the FireFly stack is ready, run the sample node.js app with:

```
# make sure you are running the commands below in the same directory of this Readme file
# for example: cd combined/mint-token-on-public-ethereum-network
export ACCOUNT_ADDRESS=$(ff accounts list polygon | jq -r '.[0].address') && echo "ACCOUNT_ADDRESS is now set to $ACCOUNT_ADDRESS"
npm install
npm start
```
