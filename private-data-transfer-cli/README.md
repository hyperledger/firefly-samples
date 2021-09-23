# Private Data Transfer CLI

This sample contains a simple CLI application that demonstrates the private
data transfer flow on FireFly.

## Setup

To run the application, you will require a 2-party FireFly system running
locally on ports 5000-5001. The easiest way to set this up is with the
[FireFly CLI](https://github.com/hyperledger/firefly-cli):

```
ff init data-transfer 2
ff start data-transfer
```

## Running

Once the FireFly stack is ready, set up and run the sample with:

```
npm install
npm start
```
