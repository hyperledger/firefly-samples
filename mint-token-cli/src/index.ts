import { FireFlyListener } from "./firefly";

async function main() {
  const ws1 = new FireFlyListener(5000);
  await ws1.ready();

  await new Promise((resolve) => setTimeout(resolve, 100000));

  ws1.close();
}

main().catch((err) => {
  console.error(`Failed to run: ${err}`);
});
