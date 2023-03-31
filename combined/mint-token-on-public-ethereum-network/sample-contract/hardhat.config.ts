import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "firefly-polygon",
  networks: {
    "firefly-polygon": {
      url: "http://localhost:5100",
    },
  },
};

export default config;
