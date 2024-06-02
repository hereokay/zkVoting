// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function mint(address to, uint256 amount) external;
}

contract VotingBox is Ownable {

    address[] public voterList; // 조회용
    mapping (uint => address) public candidateTable; // 후보자 번호 -> 메타 address 얻기
    mapping (uint => uint) public studentSaltTable; // 학번에 대한 salt 해시값 테이블
    mapping (uint => address) public addressTable; // 해시값을 통해 주소를 기록
    IERC20 public token;

    constructor(address initialOwner, address tokenAddress) Ownable(initialOwner) {
        token = IERC20(tokenAddress);
    }

    // 후보자 추가
    function addCandidate(uint candidateNumber, address onchainAddress) external onlyOwner {
        candidateTable[candidateNumber] = onchainAddress;
    }

    // 유권자 Salt 설정
    function setSalt(uint[] memory studentNumberList, uint[] memory saltHash) external onlyOwner{
        require(studentNumberList.length == saltHash.length, "array length error");
        uint length = studentNumberList.length;

        for (uint i=0; i<length; i++) 
        {
            studentSaltTable[studentNumberList[i]] = saltHash[i];
        }
    }

    function setSaltForOne(uint studentNumber, uint saltHash) external onlyOwner {
        studentSaltTable[studentNumber] = saltHash;
    }

    // 유권자 주소 할당
    // hashValue = StudentId + Salt 에 대한 Hash
    function registVoter(address voterAddress, uint hashValue) external onlyOwner {
        addressTable[hashValue] = voterAddress;
        voterList.push(voterAddress);
        
        // 투표토큰 할당
        token.mint(voterAddress, 1 ether);
    }




    // --------------- read 함수 ----------

    // 일회성 주소 계산 함수
    function voterLength() external view returns(uint){
        return voterList.length;
    }




    // TODO
    // 투표 결과 조회 함수 
    

// 이벤트 설정



}