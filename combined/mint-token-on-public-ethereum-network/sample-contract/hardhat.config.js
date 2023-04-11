"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
var config = {
    solidity: "0.8.9",
    defaultNetwork: "firefly-polygon",
    networks: {
        "firefly-polygon": {
            url: "http://localhost:5100",
        },
    },
};
exports.default = config;
