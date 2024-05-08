const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = require("ethers");



// studentId : int
// salt : string
function calcStudentSaltHash(studentId, salt){

    const strId = studentId.toString();

    const sumString = strId + salt;
    return keccak256(ethers.toUtf8Bytes(sumString));
}

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

        it("유권자 Salt 할당 및 조회", async function () {            
            const studentId = [12191654, 12209876]; // int
            const saltList = ["0","1"]; // string

            const saltHashList = [
                ethers.keccak256(ethers.toUtf8Bytes(saltList[0])),
                ethers.keccak256(ethers.toUtf8Bytes(saltList[1]))
            ];

            // Salt 할당
            await votingBox.setSalt(studentId,[
                saltHashList[0],
                saltHashList[1]
            ]);

            // 학번에 대한 Salt 해시 조회
            expect(await votingBox.studentSaltTable(studentId[0])).to.equal(
                saltHashList[0]
            );
        });

        it("유권자 주소 할당 및 토큰 배포", async function () {

            // StudentSaltHash
            // const oneHash = calcStudentSaltHash(studentId[0],saltList[0]);
        

            // const oneStudentSaltHash = ethers.keccak256(ethers.toUtf8Bytes("1"));


            // // 투표권 할당 
            // await votingBox.registVoter(addr1.address, 1);
            
            // // 조회
            // await expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"));
        });


        


        

        
    });

});