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
import {
  FIREFLY_URL,
  FUNGIBLE_POOL_ID,
  FIREFLY_ADDRESS,
  NFT_COST,
  NONFUNGIBLE_POOL_ID,
} from "./constants";

// Create an instance of the FireFly SDK
const firefly = new FireFly({ host: FIREFLY_URL });

// Create a subscription that only gives us events for confirmed token transfers
const sub: FireFlySubscriptionBase = {
  filter: {
    events: "token_transfer_confirmed",
  },
};

// Listen for events and run the callback function when a new event arrives
firefly.listen(sub, async (socket, event) => {
  // Make sure this was a transfer of fungible tokens to my FireFly node
  if (
    event.tokenTransfer?.pool === FUNGIBLE_POOL_ID &&
    event.tokenTransfer?.to === FIREFLY_ADDRESS
  ) {
    // Convert the amount of tokens transferred to a number so we can do math
    const amount = Number(event.tokenTransfer?.amount) / Math.pow(10, 18);
    const purchaser = event.tokenTransfer?.from;
    console.log(`received ${amount} from ${purchaser}`);
    // If the amount was greater than the defined cost for the NFT, mint a new NFT to the original sender
    if (amount >= NFT_COST) {
      await firefly.mintTokens({
        pool: NONFUNGIBLE_POOL_ID,
        amount: "1",
        to: purchaser,
      });
      console.log(`minted an nft to ${purchaser}`);
    }
  }
});

// Wait for ctrl+c to exit the app
process.on("SIGINT", function () {
  console.log("\nclosed");
  process.exit(0);
});
console.log("running\npress ctrl+c to exit");
process.stdin.resume();
