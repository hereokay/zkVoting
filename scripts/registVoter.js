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

/*
Token address:  0x599Aac16ade739afbEE573DCf7349152632d6f8A
VotingBox address:  0x6a779Ee772D8244C34BdDd9d912cc7932D297620
Hasher address:  0x40b4a5A6CF0c572256825184b14CE184543357d4
Verifier address:  0xDbef040a20Db6744b5035E96B8Ce4043C4925733
Tornado address:  0x0AD76d72c849991178B4A98449eECE90859542Db
*/

// 후보자를 등록하는 과정
async function main() {
    const Tokenaddress = "0x599Aac16ade739afbEE573DCf7349152632d6f8A"
    const VotingBoxaddress = "0x6a779Ee772D8244C34BdDd9d912cc7932D297620"
    const Tornadoaddress = "0x0AD76d72c849991178B4A98449eECE90859542Db"
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
        const txHash= await votingBox.setSaltForOne(user['Code'],saltHash);
        console.log(`${txHash} : ${user['Code']} : ${saltHash} 등록완료`)
        
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