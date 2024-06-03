// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const axios = require('axios');




// 후보자를 등록하는 과정
async function main() {
    const Tokenaddress = "0x834Ea01e45F9b5365314358159d92d134d89feEb"
    const VotingBoxaddress = "0x8D75F9F7f4F4C4eFAB9402261bC864f21DF0c649"
    const Hasheraddress = "0x0dEe24C99e8dF7f0E058F4F48f228CC07DB704Fc"
    const Verifieraddress = "0xFcCa971FE9Ee20C1Cf22596E700aA993D8fD19c5"
    const Tornadoaddress = "0xCC5Bc84C3FDbcF262AaDD9F76652D6784293dD9e"
    

    
    const [owner] = await hre.ethers.getSigners();
    const userList = await fetchData(); // console.log(userList[0]['Code']);
    

    const votingBox = await hre.ethers.getContractAt("VotingBox", VotingBoxaddress);
    const token = await hre.ethers.getContractAt("Token", Tokenaddress);
    const tornado = await hre.ethers.getContractAt("Tornado", Tornadoaddress);



    

}

async function fetchData() {
  try {
      const response = await axios.get('http://54.169.51.227:5000/user');
      return response.data;
  } catch (error) {
      console.error('There was a problem with the Axios request:', error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});