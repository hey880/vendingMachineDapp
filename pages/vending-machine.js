import Head from 'next/head'; //Head 컴포넌트에 직접 연결, html의 head 부분에
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import 'bulma/css/bulma.css';
import styles from '../styles/VendingMachine.module.css';
import vendingMachineContract from '../blockchain/vendingMachineContract'; //local solidity smart contract

const VendingMachine = () => {
    const [error, setError] = useState('');
    // 페이지가 로드된 다음 smart contract에 접근해서 인벤토리 번호를 가져오고 변수에 저장되게함.
    // useEffect를 이용해서 페이지가 로드될 때 실행되게 함.
    const [successMsg, setSuccessMsg] = useState('');
    const [inventory, setInventory] = useState('');
    const [myDonutCount, setMyDonutCount] = useState('');
    const [buyCount, setBuyCount] = useState('');
    const [address, setAddress] = useState(null);
    const [vmContract, setVmContract] = useState(null);
    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        if (vmContract) getInventoryHandler();
        if (vmContract && address) getMyDonutCountHandler();
    }, [vmContract, address]);

    const getInventoryHandler = async () => {
        //solidity, ethereum 에서 함수를 호출하는 방법에는 두가지가 있다.
        //하나는 call, 하나는 send. ether를 보낼 필요가 없을 때는 call 을 사용
        //ether가 오가야할 때는 send를 사용.
        const inventory = await vmContract.methods.getVendingMachineBalance().call();
        setInventory(inventory);
    }

    //페이지가 로드 되고 지갑이 연결된 다음에 우리가 몇개의 도넛을 갖고 있는지
    //확인할 수 있기 때문에 여기에는 useEffect를 사용하지 않는다.
    const getMyDonutCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call(); 
        //donutBalances 메서드는 사용자의 address를 참조함.
        setMyDonutCount(count);
    }

    const updateDonutQty = event => {
        setBuyCount(event.target.value);
    }

    const buyDonutHandler = async () => {
        try {
            await vmContract.methods.purchase(buyCount).send({
                //send는 두가지 인자를 갖는다. 이 트랜잭션을 sending 한 사람
                //sending할 ether(wei로 변환해야함)
                from: address,
                value: web3.utils.toWei('2', 'ether') * buyCount,
                gas: 3000000,
                gasPrice: null
            })
            setSuccessMsg(`${buyCount} donuts purchased!!`);

            if (vmContract) getInventoryHandler();
            if (vmContract && address) getMyDonutCountHandler();
        } catch(err) {
            setError(err.message);
        }
    }

    //window.ethereum (ethereum은 메타마스크 연결 위한 api 제공, window의 객체처럼 제공됨)
    //메타마스크에 계정을 요청할 수 있게 하는 Provider API고
    //사용자가 메시지, 트랙잭션에 서명할 수 있고 사용자가 연결된 블록체인 데이터를
    //읽을 수 있게 해줌.
    const connectWalletHandler = async () => {
        // window.ethereum은 메타마스크가 설치되어 있어야 작동함.
        // 아래는 메타마스크가 설치되어 있는지 감지하기 위한 코드.
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {//버튼을 클릭하면 메타마스크 지갑 연결요청. 이때 연결에 실패하면 4001에러 발생.
                //4001에러에 대처하기 위해 try~catch 구문 사용
                await window.ethereum.request({ method: "eth_requestAccounts" })
                //window ethereum을 이용하여 web3인스턴스를 인스턴스화.
                //이 인스턴스를 이용해서 smart contract의 메서드를 호출할 수 있다.
                const web3 = new Web3(window.ethereum); //인수로 Provider API인 window.ethereum을 받음
                setWeb3(web3);
                //이 웹 어플리케이션에 연결된 특정 계정의 도넛개수를 찾고 있으므로 계정정보를
                //가져와야 함.
                const accounts = await web3.eth.getAccounts(); //메타마스크의 API를 이용하여 내 메타마스크 지갑에서
                //계정목록을 검색. 계정목록은 배열 형태이므로 첫번째 계정(index 0)을 가져온다.
                setAddress(accounts[0]);

                // local copy contract 생성
                const vm = vendingMachineContract(web3);
                setVmContract(vm);
            } catch (err) {
                setError(err.message);
            }
        } else {
            // meta mask not installed
            console.log("Please install MetaMask.")
        }
    }

    return (
        <div className={styles.main}>
            <Head>
                <title>VendingMachine App</title>
                <meta name="description" content="A blockchain vending machine app" />
            </Head>
            {/* mt = margin top, mb = margin bottom */}
            <nav className="navbar mt-4 mb-4">
                {/* container, navbar-brand 는 bulma의 속성. container는 섹션 나누기
                navbar-brand는 로고등 들어갈 자리, navbar-end는 navbar의 오른쪽 끝에 위치 */}
                <div className="container">
                    <div className="navbar-brand">
                        <h1>Vending Machine</h1>
                    </div>
                    <div className="navbar-end">
                        {/* 지갑 연결하는 버튼 */}
                        <button onClick={connectWalletHandler} className="button is-primary">Connect Wallet</button>
                    </div>
                </div>
            </nav>
            <section>
                {/* web3.eth는 메타마스크 계정 가져오기 위해서
                web3.eth.Contract는 우리의 로컬 솔리디티 contract 복사본 생성 위해서 사용 */}
                <div className="container">
                    <h2>Vending machine inventory: {inventory}</h2>
                </div>
            </section>
            <section>
                <div className="container">
                    <h2>My donuts: {myDonutCount}</h2>
                </div>
            </section>
            <section className="mt-5">
                <div className="container">
                    <div className="field">
                        <label className="label">Buy donuts</label>
                        <div className="control">
                            <input className="input" type="type" placeholder="Enter amount..." onChange={updateDonutQty} />
                        </div>
                        <button onClick={buyDonutHandler}
                            className="button is-primary mt-2">Buy</button>
                    </div>
                </div>
            </section>
            <section>
                <div className="container has-text-danger">
                    <p>{error}</p>
                </div>
            </section>
            <section>
                <div className="container has-text-success">
                    <p>{successMsg}</p>
                </div>
            </section>
        </div>
    )
}

export default VendingMachine;