# Mint Token CLI

This sample contains a simple CLI application that demonstrates listening for token minting FireFly events from another application. It must
be used with another application that actually mints tokens for the CLI to listen for. This could be the [mint-token-ui](../mint-token-ui) sample
or another application such as the FireFly sandbox.

## Setup

If using this sample with the [mint-token-ui](../mint-token-ui) sample you can skip these steps and follow the ones in the [mint-token-ui](../mint-token-ui) README.

To run the application, you will require a 1 party FireFly system running
locally on ports 5000. The easiest way to set this up is with the
[FireFly CLI](https://github.com/hyperledger/firefly-cli):

```
ff init mint-token-stack 1
ff start mint-token-stack
```

Once you have a stack you will need to use the FireFly sandbox (or APIs) to create a token pool
called MINTSAMPLE:

![FireFly Sandbox](./sandbox-token-pool.png)

To create a token pool for an existing ERC20 contract on a public chain you must provide the contract address and block number for the contract.

## Running

Once the FireFly stack is ready, set up and run the sample with:

```
npm install
npm start
```
