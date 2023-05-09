# Fungible to Non-Fungible Token Swap

This sample app illustrates a very trivial token swap implemented in a FireFly App. It uses two contracts, an ERC-20 (fungible) and an ERC-721 (non-fungible) contract.

![Sample App Illustration](./docs/sample_app.svg)

1. Any wallet can send a certain number of ERC-20 tokens to the FireFly wallet address.
1. FireFly will see the token transfer event on the blockchain and track it
1. FireFly will then notify the sample app over a WebSocket connection
1. If the amount is sufficient, the sample app will call FireFly's Mint API to send a new NFT to the original wallet that sent the ERC-20 tokens
1. FireFly will call the mint function on the ERC-721 contract
1. The new NFT will show up in the wallet app

## Setup

Before you can run this sample you will need:

- A FireFly stack up and running using a public blockchain
- Another wallet app connected to this same blockchain
- An ERC-20 and ERC-721 contract deployed to the chain
- A Token Pool created for each contract in FireFly
- Node.js installed on your dev machine

## Configuring the sample

Export the following environment variables and set them to the ID for each Token Pool you created above:

```bash
export FUNGIBLE_POOL_ID=""
export NONFUNGIBLE_POOL_ID=""
```

Export the following environment variable and set it to your FireFly signing address:

```bash
export FIREFLY_ADDRESS=""
```

To find out your FireFly signing address you can run:

```bash
ff accounts list <your_stack_name> | grep address
```

## Building and running the sample

At this point you should be able to run:

```
npm install
```

```
npm start
```

## Using the sample

If you don't have any ERC-20 tokens in another wallet for the contract that you're using, you will need to mint/transfer some tokens to another wallet.

Then if you transfer 10 tokens back to FireFly, you should see the sample app mint an NFT in exchange.
