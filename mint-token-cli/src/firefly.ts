import WebSocket from "ws";

export interface FireFlyBlockchainEventMessage {
  id: string;
  type: string;
  blockchainEvent: {
    info: {
      blockNumber: string;
      transactionHash: string;
      signature: string;
    };
  };
}

export interface FireFlyMessage {
  id: string;
  type: string;
  tokenTransfer: {
    amount: string;
  };
}

export class FireFlyListener {
  private ws: WebSocket;
  private connected: Promise<void>;

  constructor(port: number, ns = "default") {
    this.ws = new WebSocket(
      `ws://localhost:${port}/ws?namespace=${ns}&ephemeral&autoack`
    );
    this.connected = new Promise<void>((resolve) => {
      this.ws.on("open", resolve);
      this.ws.on("message", (data: string) => {
        let msg: FireFlyMessage = JSON.parse(data);
        if (msg.type === "token_transfer_confirmed") {
          console.log("Token transfer event received:");
          console.log(
            ` - Tokens minted: ${parseInt(msg.tokenTransfer.amount) / 1e18}`
          );
          console.log(""); // Newline for prettier formatting
        } else if (msg.type === "blockchain_event_received") {
          console.log("Blockchain event received:");
          let blockchainEvent: FireFlyBlockchainEventMessage = JSON.parse(data);
          console.log(
            ` - Block number: ${blockchainEvent.blockchainEvent.info.blockNumber}`
          );
          console.log(
            ` - Transaction hash: ${blockchainEvent.blockchainEvent.info.transactionHash}`
          );
          console.log(
            ` - Method signature: ${blockchainEvent.blockchainEvent.info.signature}`
          );
          console.log(""); // Newline for prettier formatting
        }
      });
      console.log("Waiting for FireFly events...\n");
    });
  }

  ready() {
    return this.connected;
  }

  close() {
    this.ws.close();
  }
}
