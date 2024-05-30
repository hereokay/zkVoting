// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    
    [owner] = await hre.ethers.getSigners();

    // 투표토큰 배포
    token = await hre.ethers.deployContract("Token");
    console.log("Token address: ", token.target);
    // 투표관리 컨트랙트 배포
    votingBox = await hre.ethers.deployContract("VotingBox",[owner.address,token.target]);
    console.log("VotingBox address: ", votingBox.target);

    hasher = await hre.ethers.deployContract("Hasher");
    console.log("Hasher address: ", hasher.target);

    verifier = await hre.ethers.deployContract("Verifier");
    console.log("Verifier address: ", verifier.target);

    tornado = await hre.ethers.deployContract("Tornado", [hasher.target, verifier.target]);
    console.log("Tornado address: ", tornado.target);

    await token.setOwner(votingBox.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});