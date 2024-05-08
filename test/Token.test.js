const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("ethers");



describe("contract deployment", function () {
    let token, votingBox;
    let owner, addr1, addr2;
  
    let hasher, verifier, tornado;

    before(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();

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

    });

    describe("Token", function () {
        it("VotingBox에게 mint 권한부여", async function () {
            await token.setOwner(votingBox.target);
            expect(await token.owner()).to.equal(votingBox.target);
        });

        it("권한없는 사람은 mint 실패", async function () {
            await expect(token.mint(addr1.address, ethers.parseEther("1")))
            .to.be.revertedWith("Sender not authorized.");  
        });

        it("유권자에게 토큰 할당", async function () {

            // 투표권 할당 
            await votingBox.registVoter(addr1.address, 1);
            
            // 조회
            await expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"));
        });

        
        

        

        
    });

});