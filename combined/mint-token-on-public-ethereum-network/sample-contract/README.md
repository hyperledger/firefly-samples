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

You will need the `.json` file that your compiler generated in the previous step. If you used hardhat to compile a contract in this project, it will be at `artifacts/contracts/<contract_name>.sol/<contract_name>.json`

If you compiled your contract with Remix, the `.json` file will be under the `artifacts` directory. Copy the contents of this file to a file on your local file system.

You can use the FireFly CLI to deploy your contract with a command like this:

```
ff deploy ethereum polygon <your_contract>.json
```

```
{
  "address": "0x4C4706aDE858c1D182FBdD1A8A29353b7455b678"
}
```

It's a good idea to search for your contract address on [Polygonscan](https://mumbai.polygonscan.com/) to find out what block number in which the contract was constructed. You will need this for the next step.

## Create a Token Pool

To index our token and track mint / transfer events we are going to create a Token Pool in FireFly.

Navigate to the FireFly Sandbox at: [http://127.0.0.1:5109](http://127.0.0.1:5109). On the Tokens tab fill in the following details to **Create a Token Pool**:

| Field                | Value                                        |
| -------------------- | -------------------------------------------- |
| **Pool Name**        | `FireflySample`                                  |
| **Pool Symbol**      | (leave blank)                                |
| **Type**             | Fungible                                 |
| **Contract address** | `0x4C4706aDE858c1D182FBdD1A8A29353b7455b678` |
| **Block number**     | `33769329`                                   |

## Create a Contract Interface

1. First, navigate to the [FireFly Sandbox](http://127.0.0.1:5109/home?action=contracts.interface) and go to the **Contracts** tab. Expand the **Define a Contract Interface** section.
1. Select **ABI - Solidity Application Binary Interface** from the Interface Format drop down.
1. Give it a name, such as **`FireflySample`**
1. Give it a version such as **`1.0`**
2. Copy the `"abi"` section from the [combined JSON file for the contract in this repo](./artifacts/contracts/FireFlySample.sol/FireFlySampleToken.json). Copy the whole JSON array. Paste this into the **Schema** field in the Sandbox.
3. Click **Run**

## Register a Contract API

1. Still on the same page in the Sandbox, expand the `Register a Contract API` section.
1. Ensure the **`FireflySample`** Contract Interface created in the step above is selected
1. Give it a URL-safe name such as **`FireflySample`**
1. Paste the contract address: **`0x4C4706aDE858c1D182FBdD1A8A29353b7455b678`**
1. Click **Run**

## Mint a token to your wallet

Before you do this step, make sure you have the sample application running following instructions [here](../README.md#running)

Not you can open the Swagger UI or use the [Firefly Sandbox Mint Token tab](http://127.0.0.1:5109/home?action=tokens.mint) to mint a token.


