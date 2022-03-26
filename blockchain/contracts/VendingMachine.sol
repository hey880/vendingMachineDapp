// SPDX-License-Identifier: MIT
// solidity 버전은 truffle-config.js 파일에서 compiler의 버전을 확인하여 작성해야한다.
pragma solidity ^0.8.13;

contract VendingMachine {
    // smart contract deployer 설정
    address public owner;
    mapping (address => uint) public donutBalances;

    // set owner, set donut balances 역할을 하는 생성자
    // 여기서 constructor는 smart contract가 deploy 될 때 호출되고
    // 우리한테 deploy한 사람의 address를 준다.
    constructor () {
        //msg is special global variable
        //and it has property called sender
        owner = msg.sender; // 함수 호출 혹은 트랜잭션 발생시킨 사람의 etherium address
        
        //여기서 this는 current contract의 주소를 제공하는 방법
        donutBalances[address(this)] = 100; //owner의 address를 참조.
    }

//"view" means this function is not modify any data on the blockchain
//but can read data from the blockchain
//"pure" 는 modifying, reading 둘 다 안되는 걸 의미
    function getVendingMachineBalance () public view returns (uint) {
        return donutBalances[address(this)]; //도넛의 개수를 this contract(current contract)의 address와 연관지어서 반환
    }

//인자로 number of items being added to the vending machine 받음
//block chain 데이터를 modify 할거니까 view나 pure로 표시하지 않음
//반환할 값도 없으니까 return 타입도 지정할 필요 없음
//단, smart contract의 owner만 호출할 수 있도록 지정해야함 => require문 사용
//require의 첫번째 인자는 충족해야할 조건, 두번째는 화면에 표시하거나 빽단에 보낼 에러메세지
    function restock(uint amount) public {
        require(msg.sender == owner, "Only the owner can restock this machine.");
        donutBalances[address(this)] += amount;
    }

// payable keword is used for any function which needs to receive ether
// payable 키워드가 없이 ether를 보내려고 하면 transaction이 그 ether를
// 돌려보낼 수 있다. 중요.
// 도넛을 구매하면 내 도넛 개수는 increment, vending machine의 도넛 개수는 decrement 해야함.
// 인자로 구매할 도넛 개수(amount)를 받음
    function purchase(uint amount) public payable {
        // 들어오는 ether의 양에 대한 참조로 msg.value 사용
        // 도넛 한 개의 가격을 2 ether로 책정함. 그래서 amount * 2 ether
        require(msg.value >= amount * 2 ether, "You must pay at least 2 ether per donut");
        require(donutBalances[address(this)] >= amount, "Not enough donuts in stock to fulfill purchase request");
        donutBalances[address(this)] -= amount;
        donutBalances[msg.sender] += amount; //sender가 purchase function call한 사람
        //즉, 도넛 구매자니까 sender의 address를 참조해서 amount를 increment 함

        //이제 purchaser가 돈을 보냈는지, 충분한 돈을 보냈는지를 체크해야함 (이 함수 최상단의 require문)
        //사용자가 구매할 만큼의 도넛이 vending machine에 있는지도 체크해야함 (위 require문 다음의 require문)
        //구매 할 때 2개 구매한다고 딱 4ether를 보내면 안된다. 거래에 가스비가 들기 때문.
        //4ether를 보내면 도넛 1개만 구매할 수 있다. 가스비가 포함되면 4ether+가스비 까지 보내야하니까.
    }
}