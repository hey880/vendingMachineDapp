//abi에 대한 변수 생성. npm run compile을 통해서 얻은 build 파일의 전문을 넣어준다.
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}];

//local copy smart contract
//Contract메서드의 인자로 abi, 테스트넷에 배포된 smart contract의 address가 들어간다.
const vendingMachineContract = web3 => {
    return new web3.eth.Contract(
        abi,
        "0xAf1c8d5e7F3dE3c8dB93F186e1D8d0b67621476d"
    )    
}     

export default vendingMachineContract;