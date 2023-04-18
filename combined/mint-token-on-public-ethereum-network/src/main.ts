// Copyright © 2023 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import FireFly, { FireFlySubscriptionBase } from "@hyperledger/firefly-sdk";

let totalMinted = 0;
let MAX_TOTAL_MINTED = 2;
if (
  !process.env.ACCOUNT_ADDRESS ||
  !process.env.ACCOUNT_ADDRESS.startsWith("0x")
) {
  console.log(
    "ACCOUNT_ADDRESS must be set to a valid eth address, you should use the account of your local Firefly stack."
  );
  process.exit(1);
}

/**
 * Main firefly SDK example code START
 * This sample code demonstrate how to listen to firefly events using filters
 * and mint tokens whenever the selected event satisfy our check
 */

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
      console.log("Mint event detected, minting another token...");
      await firefly.mintTokens({
        amount: operations[0].input?.amount,
        idempotencyKey: operations[0].input?.localId,
        pool: operations[0].input?.pool,
      });
      totalMinted++;
    }
  }
});

/**
 * Main firefly SDK example code END
 */

function wait() {
  if (totalMinted < MAX_TOTAL_MINTED) {
    setTimeout(wait, 5000);
    console.log(
      `Waiting for more tokens to be minted..., total token minted during the run: ${totalMinted}`
    );
  } else {
    console.log(
      `Exiting the application with ${totalMinted}/${MAX_TOTAL_MINTED} minted.`
    );
    process.exit(0);
  }
}
wait();
