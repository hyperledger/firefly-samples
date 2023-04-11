## Create the sample ERC-20 token contract

_This instruction is based on the 2022 Hyperledger workshop created by [Nicko Guyer](https://github.com/nguyer) for creating NFT, you can find the original version [here](https://github.com/nguyer/global-forum-2022-firefly-workshop)_

You can either use the [contract in this repo](../contracts/FireFlySample.sol) as a starting point, or you can create your own. The [Open Zeppelin Contracts Wizard](https://docs.openzeppelin.com/contracts/4.x/wizard) is a great starting point if you want to create your own contract.
### Compile your contract

If you're using this git repo, you can run:

```
npm install
npx hardhat compile
```

This will create a directory structure under `artifacts` which will contain a `.json` file containing the ABI and the EVM bytecode for your contract.

## Deploy your contract

You will need the `.json` file that your compiler generated in the previous step. If you used hardhat to compile a contract in this project, it will be at [./artifacts/contracts/FireflySample.sol/FireflySampleToken.json](./artifacts/contracts/FireflySample.sol/FireflySampleToken.json)

If you compiled your contract with Remix, the `.json` file will be under the `artifacts` directory. Copy the contents of this file to a file on your local file system.

Follow the [deploy custom smart contract example](https://hyperledger.github.io/firefly/tutorials/custom_contracts/ethereum.html#contract-deployment) to deploy your smart contract. Take a note of the smart contract address and you will need to replace `0x4C4706aDE858c1D182FBdD1A8A29353b7455b678` with that address for the instructions below.

It's a good idea to search for your contract address on [Polygonscan](https://mumbai.polygonscan.com/) to find out what block number in which the contract was constructed. You will need this for the next step.

## Create a Token Pool

To index our token and track mint / transfer events we are going to create a Token Pool in FireFly.

Navigate to the FireFly Sandbox at: [http://127.0.0.1:5109](http://127.0.0.1:5109). On the Tokens tab fill in the following details to **Create a Token Pool**:

| Field                | Value                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| **Pool Name**        | `FireflySample`                                                       |
| **Pool Symbol**      | (leave blank)                                                         |
| **Type**             | Fungible                                                              |
| **Contract address** | `0x4C4706aDE858c1D182FBdD1A8A29353b7455b678`                          |
| **Block number**     | `<set to the latest block number on https://mumbai.polygonscan.com/>` |

## Mint a token to your wallet

Before you do this step, make sure you have the sample application running following instructions [here](../README.md#running)

After you have the sample application running, you can use the [Firefly Sandbox Mint Token tab](http://127.0.0.1:5109/home?action=tokens.mint) to mint a Fungible token using the registered token pool `FireflySample`.


