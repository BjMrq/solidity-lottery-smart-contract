import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';
import { lotteryContractAbi, lotteryContractEvents } from './contract/lottery-contract';
import web3 from './contract/web3-instance';
import { NewParticipantEvent, WinnerEvent } from "./types/abi-events";

function App() {
  const [userIsManager, setUserIsManager] = useState(false)
  const [currentUserAddress, setCurrentUserAddress] = useState("")
  const [transactionProcessRunning, setCanTransactionProcessRunning] = useState<boolean>(false);
  const [lotteryBalance, setLotteryBalance] = useState<string>("0");
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const [participantAmount, setParticipantAmount] = useState<string>("0");
  const [participantsAddresses, setParticipantsAddresses] = useState<string[]>([]);

  const setContractState = async (userAddress?: string) => {
    setParticipantsAddresses(await lotteryContractAbi.getAllParticipators().call());
    setLotteryBalance(await lotteryContractAbi.getBalance().call());
    setCanParticipate(await lotteryContractAbi.canParticipate().call({from: userAddress || currentUserAddress}))
  }

  const setCurrentUser = async (userAddress: string) => {
    setCurrentUserAddress(userAddress)
    setUserIsManager(userAddress === await lotteryContractAbi.organizerAddress().call())
  }

  const subscribeToContractEvents = (userAddress: string) => {
    lotteryContractEvents.NewParticipation()
      .on('data', (newParticipantEvent: NewParticipantEvent) => {
        console.log(newParticipantEvent);
        setContractState(userAddress)
      }).on('error', console.error)

    lotteryContractEvents.WinnerPicked().on('data', (winnerPickedEvent: WinnerEvent) => {
      console.log(winnerPickedEvent);
      setContractState(userAddress)
    }).on('error', console.error)
  }

  useEffect(() => {
    (async () => {
      const userAddress = (await web3.eth.getAccounts())[0]
      setCurrentUser(userAddress)
      setContractState(userAddress)

      subscribeToContractEvents(userAddress)
      
    })();
  }, []);

  const selectAWinner = async () => {
    setCanTransactionProcessRunning(true)
    await lotteryContractAbi.pickWinner().send({
      from: currentUserAddress
    })
    setCanTransactionProcessRunning(false)
    setContractState()
  }

  const participateLottery = async(formEvent: ChangeEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    setCanTransactionProcessRunning(true)
    await lotteryContractAbi.participateLottery().send({
      from: currentUserAddress,
      value: web3.utils.toWei(participantAmount, "ether")
    })
    setCanTransactionProcessRunning(false)
    setContractState()
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Lottery</h2>
        <p>
          Potential jackpot {lotteryBalance && web3.utils.fromWei(lotteryBalance, "ether")}!
        </p>
        {transactionProcessRunning ? 
          <p>Waiting for transaction to complete...</p>
          :
          canParticipate ?  
            <form action="" onSubmit={participateLottery}>
              <label htmlFor="newPlayerAmount" >Test your luck! (Enter a minimum of 0,1 ether to participate) :</label>
              <br/><br/>
              <input type="number" style={{float: "left"}} id="newPlayerAmount" step=".01" onChange={({target: {value}}) => setParticipantAmount(String(value))}/>
              <input type="submit" style={{float: "left"}} />
              <br/>
            </form> 
            : 
            <p> Thanks for participating, will see how it goes! </p>
        }
        <p>Current participants:</p>
        {participantsAddresses.map(((participantAddress) => <li key={participantAddress}>{participantAddress}</li>))}
        <br/>
        {userIsManager && <button onClick={selectAWinner}>Select a winner!</button>}
      </header>
    </div>
  );
}

export default App;
