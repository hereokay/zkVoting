// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const axios = require('axios');


const {
    fetchUserList,
    putUserSalt,
    putUserAddress,
    getUserByCode
} = require("../utils/back.js");


// 후보자를 등록하는 과정
async function main() {
    const Tokenaddress = "0x1539d89CA6C8a5E395967AAB7176A4Ba21D99280"
    const VotingBoxaddress = "0x2832B0e3cd778e3991933FbBcCD5FbEbE651Fe24"
    const Tornadoaddress = "0xe6f20e4f874272d446E3b51B411167009095B707"

    const votingBox = await hre.ethers.getContractAt("VotingBox", VotingBoxaddress);
    const token = await hre.ethers.getContractAt("Token", Tokenaddress);
    const tornado = await hre.ethers.getContractAt("Tornado", Tornadoaddress);


}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});