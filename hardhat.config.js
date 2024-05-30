require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // Load environment variables from .env file


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.17",
      },
      {
        version: "0.6.11",
      },
    ],
  },

  networks: {
    amoy: {
      url: process.env.NODE_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
