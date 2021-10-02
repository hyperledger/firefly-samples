import React, { useState } from "react";
import './App.css';
import InputWithLabel from "./components/InputWithLabel";

function App() {

  const [message, setMessage] = useState({stockSymbol: "", stockPrice: ""})

  const handleInput = (event) =>{
    event.persist()
    if(event.target.id === "stockPrice") {
      setMessage(prevState => {
        return {...prevState, stockPrice: event.target.value }
      })
    }
    if(event.target.id === "stockSymbol") {
      setMessage(prevState => {
        return {...prevState, stockSymbol: event.target.value }
      })
    }
  }

  function handleSubmit(){
    //TODO add date and POST to the blockchain
    let myObj = {stockPrice: `${message.stockPrice}`, stockSymbol: `${message.stockSymbol}`}
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="InputWithLabel">
          <InputWithLabel  id="stockPrice" label="Stock Price:" value={message.stockPrice} onInputChange={handleInput} />
        </div><div className="InputWithLabel">
          <InputWithLabel  id="stockSymbol" label="Stock Symbol:" value={message.stockSymbol} onInputChange={handleInput} />
        </div>
        <button className="SubmitButton" onClick={() => {
          
          handleSubmit();

        }} >Submit</button>
        
      </header>
    </div>
  );
}

export default App;
