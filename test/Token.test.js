const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("ethers");



describe("VotingBox contract deployment", function () {
    let token, votingBox;
    let owner, addr1, addr2;
  

    before(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        // 투표토큰 배포
        token = await hre.ethers.deployContract("Token");
        // 투표관리 컨트랙트 배포
        votingBox = await hre.ethers.deployContract("VotingBox",[owner.address,token.target]);
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
    });

});