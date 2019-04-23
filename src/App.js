import React, { useState } from "react";
import "./App.css";

const getState = () => {
  try {
    const state = localStorage.getItem("lpfaucon.calibrate.state");
    return state ? JSON.parse(state) : [];
  } catch {
    return [];
  }
};

const Header = ({ show, setShow, view, setView }) => {
  return (
    <div className="bet-list">
      <div className="container">
        <div
          className={"bet-button" + (view === "bets" ? " button-selected" : "")}
          onClick={() => setView("bets")}
        >
          <i className="fas fa-flask" />
        </div>
        {show && (
          <div className="bet-button" onClick={() => setShow(!show)}>
            <i className="fas fa-eye" />
          </div>
        )}
        {!show && (
          <div className="bet-button" onClick={() => setShow(!show)}>
            <i className="fas fa-eye-slash" />
          </div>
        )}
        <div
          className={
            "bet-button" + (view === "stats" ? " button-selected" : "")
          }
          onClick={() => setView("stats")}
        >
          <i className="fas fa-chart-bar" />
        </div>
        <div
          className={"bet-button" + (view === "help" ? " button-selected" : "")}
          onClick={() => setView("help")}
        >
          <i className="fas fa-question" />
        </div>
      </div>
    </div>
  );
};

const Bet = ({ show, title, proba, outcome, deleted, updateBet }) => {
  if (!show && outcome !== undefined) {
    return null;
  }
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="container">
        <span className="bet-proba">{proba.toFixed(2)}</span>
        <span className="bet-title">{title}</span>

        <div className="bet-button" onClick={() => setOpen(!open)}>
          <i className="fas fa-pen" />
        </div>
      </div>
      {open && (
        <div className="container">
          <div
            className={
              "bet-button button-green" +
              (outcome === true ? " button-selected" : "")
            }
            onClick={() => updateBet({ outcome: true })}
          >
            <i className="fas fa-check" />
          </div>
          <div
            className={
              "bet-button button-red" +
              (outcome === false ? " button-selected" : "")
            }
            onClick={() => updateBet({ outcome: false })}
          >
            <i className="fas fa-times" />
          </div>
          <div
            className="bet-button"
            onClick={() => updateBet({ deleted: true })}
          >
            <i className="fas fa-trash" />
          </div>
        </div>
      )}
    </div>
  );
};

const BetList = ({ show, bets, updateBet }) => {
  return (
    <div className="bet-list">
      {bets.map((bet, i) => (
        <Bet
          key={bet.id}
          {...bet}
          show={show}
          updateBet={o => updateBet(i, o)}
        />
      ))}
    </div>
  );
};

const MakeBet = ({ bets, addBet }) => {
  const [proba, setProba] = useState(0.5);
  const [title, setTitle] = useState("");

  const handleClick = multiplier => () => {
    const p = 1 - Math.exp(Math.log(1 - proba) - multiplier * 0.42);
    if (p >= 0.499 && p <= 0.99) setProba(p);
  };

  const submitBet = () => {
    const id = bets.length > 0 ? bets[bets.length - 1].id + 1 : 0;
    const p = parseFloat(proba.toFixed(2));
    if (title) addBet({ proba: p, title, id });
    setTitle("");
  };

  const handleTitleChange = e => {
    setTitle(e.target.value);
  };

  return (
    <div className="new-bet">
      <span>Make a Bet</span>
      <textarea
        onChange={handleTitleChange}
        className="make-bet-textarea"
        value={title}
      />
      <div>
        <button onClick={handleClick(-1)}>-</button>
        <span>{proba.toFixed(2)}</span>
        <button onClick={handleClick(1)}>+</button>
      </div>
      <button onClick={submitBet}>Make Bet</button>
    </div>
  );
};

const Help = () => {
  return (
    <div className="container">
      <span>For help, please contact lpfaucon@gmail.com</span>
    </div>
  );
};

const Stats = ({ bets }) => {
  const pastBets = bets.filter(b => b.outcome !== undefined);

  const doc = pastBets.reduce((acc, bet) => {
    acc[bet.proba] = acc[bet.proba] || [];

    acc[bet.proba].push(bet.outcome);
    return acc;
  }, {});

  console.log(doc);

  return (
    <div>
      {/* <div className="container stat-container">
        <span className="stat-text">Current bets:</span>
        <span className="stat-text">{currentBets.length}</span>
      </div>
      <div className="container stat-container">
        <span className="stat-text">Past bets:</span>
        <span className="stat-text">{pastBets.length}</span>
      </div>
      <div className="container stat-container">
        <span className="stat-text">Successful bets:</span>
        <span className="stat-text">{successfulBets.length}</span>
      </div>
      <div className="container stat-container">
        <span className="stat-text">Failed bets:</span>
        <span className="stat-text">{failedBets.length}</span>
      </div> */}

      <table className="container stat-container">
        <tbody>
          <tr>
            <th>Category</th>
            <th>Result</th>
            <th>Count</th>
          </tr>
          {Object.keys(doc)
            .sort()
            .map(p => (
              <tr key={p}>
                <td>Bets at {100 * p}%</td>
                <td>
                  {(
                    (100 * doc[p].filter(x => x).length) /
                    doc[p].length
                  ).toFixed(1)}
                  %
                </td>
                <td>{doc[p].length}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const App = () => {
  const [bets, setBets] = useState(getState());
  const [view, setView] = useState("bets");
  const [show, setShow] = useState(false);

  const addBet = bet => {
    const newBets = [...bets, bet];
    localStorage.setItem("lpfaucon.calibrate.state", JSON.stringify(newBets));
    setBets(newBets);
  };

  const updateBet = (idx, obj) => {
    bets[idx] = { ...bets[idx], ...obj };
    const newBets = bets.filter(b => !b.deleted);
    localStorage.setItem("lpfaucon.calibrate.state", JSON.stringify(newBets));
    setBets(newBets);
  };

  return (
    <div className="App">
      <Header setView={setView} view={view} show={show} setShow={setShow} />
      {view === "bets" && (
        <BetList show={show} bets={bets} updateBet={updateBet} />
      )}
      {view === "bets" && <MakeBet bets={bets} addBet={addBet} />}
      {view === "help" && <Help />}
      {view === "stats" && <Stats bets={bets} />}
    </div>
  );
};

export default App;
