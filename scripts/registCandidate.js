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
    const Tokenaddress = "0x4C8c9967f90E0C66452ca3577639187A3b3e9eF3"
    const VotingBoxaddress = "0xD4d6A26CdeAb40F61C430aB25baEb2C0c23b88aD"
    const Tornadoaddress = "0xF93da63aC52634D1996AC0dE7EdFd3fa5dcF5cd6"


    const cadidateList = [
      '0x85E6cC88F3055b589eb1d4030863be2CFcc0763E',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0x5BD63a7ECc13b955C4F57e3F12A64c10263C14c1'
    ]

    const votingBox = await hre.ethers.getContractAt("VotingBox", VotingBoxaddress);
    const token = await hre.ethers.getContractAt("Token", Tokenaddress);
    const tornado = await hre.ethers.getContractAt("Tornado", Tornadoaddress);

    // await votingBox.addCandidate(1, cadidateList[0]);
    // await votingBox.addCandidate(2, cadidateList[1]);
    await votingBox.addCandidate(0, cadidateList[2]);

}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/// 19970542151702934369367482590522924987019939050486916236202599119463928648810,0x8F1864674a91A4147c4661f5Dd4190fAa358A0D5