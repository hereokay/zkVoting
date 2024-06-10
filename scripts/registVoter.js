// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file


const {
    fetchUserList,
    putUserSalt,
    putUserAddress,
    getUserByCode
} = require("../utils/back.js");

const end_point = process.env.END_POINT;
let owner ;

// 후보자를 등록하는 과정
async function main() {
    const Tokenaddress = "0x4C8c9967f90E0C66452ca3577639187A3b3e9eF3"
    const VotingBoxaddress = "0xD4d6A26CdeAb40F61C430aB25baEb2C0c23b88aD"
    const Tornadoaddress = "0xF93da63aC52634D1996AC0dE7EdFd3fa5dcF5cd6"

    [owner] = await hre.ethers.getSigners();
    

    const votingBox = await hre.ethers.getContractAt("VotingBox", VotingBoxaddress);
    const token = await hre.ethers.getContractAt("Token", Tokenaddress);
    // const tornado = await hre.ethers.getContractAt("Tornado", Tornadoaddress);
    
    await userSaltControl(votingBox);
}



async function userSaltControl(votingBox){
    const userList = await fetchUserList();

    for(let user of userList){
        const randomSalt = BigInt(ethers.hexlify(ethers.randomBytes(32)))
        user['Salt'] = randomSalt.toString();


        await putUserSalt(user);

        // onchain 호출
        await setUserSaltOnchain(user,votingBox);
    }

}

async function setUserSaltOnchain(user, votingBox){
    try {
        // user['Salt']
        const saltHash = BigInt(ethers.keccak256(ethers.toUtf8Bytes(user['Salt'])));
        await votingBox.setSaltForOne(user['Code'],saltHash);
        
    } catch (error) {
        console.error('There was a problem with the Onchain request:', error);
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});