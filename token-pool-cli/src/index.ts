import { FireFly, FireFlyListener, TokenPool } from "./firefly";

const TIMEOUT = 15 * 1000;

async function main() {
  const firefly1 = new FireFly(5000);
  const ws = new FireFlyListener(5000);
  await ws.ready();

  const poolData: TokenPool = 
    { name: "pool" ,  // For simplicity's sake, keep token pool name the same while playing with this demo
      type: "nonfungible" 
    };

  /*
    First, let's get grab the identities of the two members of our network and print them for reference.
  */

  const accounts = await firefly1.getAccounts();
  let account1 = accounts[1].identity;
  let account2 = accounts[0].identity;
  console.log(`Account 1 address: ${account1}`);
  console.log(`Account 2 address: ${account2}`);

  /*
    Initially, we will create a token pool (if it doesnt exist already) and mint 2 non-fungible tokens, by passing in "2" to
    our mintToken() function. These will be minted to account1, which we have passed in as well.
  */

  if (!await firefly1.getTokenPoolByName(poolData.name)) {
    console.log("Token pool doesnt exist - creating now");
    await firefly1.createPool(poolData);
    let poolMessage = await ws.firstMessageOfType("token_pool_confirmed", TIMEOUT);
    if (poolMessage === undefined ) {
      throw new Error(`Pool was not created successfully.`);
    } else {
      console.log(`Pool creation message: ${JSON.stringify(poolMessage, null, 1)}`);
    }
  }

  await firefly1.mintToken("1", account1,  poolData.name, "firstMint");
  await firefly1.mintToken("1", account1, poolData.name, "secondMint");

  let receivedMessage = await ws.firstMessageOfType("message_confirmed", TIMEOUT, "secondMint");

  if (receivedMessage === undefined ) {
    throw new Error(`Mint was not done.`);
  } else {
    console.log(`Mint message: ${JSON.stringify(receivedMessage, null, 1)}`);
  }

  /*
    Next, we will transfer the token with index 1 to account2. After that, you can update the below transferToken() 
    call to transfer other tokens by passing in a new token index.
  */

  await firefly1.transferToken("3", poolData.name, account2, "firstTransfer");

  let nextReceivedMessage = await ws.firstMessageOfType("message_confirmed", TIMEOUT, "firstTransfer");
  if (nextReceivedMessage === undefined) {
    throw new Error(`Transfer was not done. Verify that this token exists and is starting out in Wallet 1.`);
  } else {
    console.log(`Transfer message: ${JSON.stringify(nextReceivedMessage, null, 1)}`);
  }

  /*
    Lastly, let's print out the list of tokens along with who owns them. As you mint/transfer more tokens,
    you will  see the changes reflected in the list.
  */

  const tokens = await firefly1.checkBalance();
  for (let token of tokens) {
    if(token.balance !== "0") {
      console.log(`${token.key === account1 ? 'Account 1' : 'Account 2'} owns token ${token.tokenIndex}`);
    }
  }

  ws.close();
}

main().catch(err => {
  console.error(`Failed to run: ${err}`);
});
