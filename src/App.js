import React, { useState } from "react";
import "./App.css";

//check for support
const IDBsupport = "indexedDB" in window;

var db, request;
request = indexedDB.open("data", 13);
request.onerror = function(event) {
  console.log("Why didn't you allow my web app to use IndexedDB?!");
};
request.onsuccess = function(event) {
  console.log("What a success !");
  db = event.target.result;
  db.onerror = function(event) {
    // Generic error handler for all errors targeted at this database's
    // requests!
    console.error("Database error: " + event.target.errorCode);
  };
};
// This event is only implemented in recent browsers
request.onupgradeneeded = function(event) {
  console.log("upgrading");
  // Save the IDBDatabase interface
  var db = event.target.result;
  // Create an objectStore for this database
  if (!db.objectStoreNames.contains("bets")) {
    db.createObjectStore("bets", { autoIncrement: true });
  }
};

const Header = ({ view, setView }) => {
  return (
    <div className="header">
      <div
        className={"header-button" + (view === "intro" ? " selected" : "")}
        onClick={() => setView("intro")}
      >
        <i className="fas fa-atom" />
      </div>
      <div
        className={"header-button" + (view === "bets" ? " selected" : "")}
        onClick={() => setView("bets")}
      >
        <i className="fas fa-brain" />
      </div>
      <div
        className={"header-button" + (view === "stats" ? " selected" : "")}
        onClick={() => setView("stats")}
      >
        <i className="fas fa-chart-bar" />
      </div>
      <div
        className={"header-button" + (view === "help" ? " selected" : "")}
        onClick={() => setView("help")}
      >
        <i className="fas fa-question" />
      </div>
      <div
        className={"header-button" + (view === "settings" ? " selected" : "")}
        onClick={() => setView("settings")}
      >
        <i className="fas fa-cog" />
      </div>
    </div>
  );
};

const gradient = "#fff;#eee;#ddd;#ccc;#aaa;#888;#666;#444;#333;#222;#111".split(
  ";"
);

const probabilities = [1, 3, 10, 25, 40, 50, 60, 75, 90, 97, 99];

const filters = ["Filter1", "Filter2", "Filter3", "Filter4", "Filter5"];

const FilterList = ({ filter, setFilter }) => {
  return (
    <div className="filter-list">
      <span
        onClick={() => setFilter("All")}
        className={"filter" + ("All" === filter ? " selected" : "")}
      >
        All
      </span>
      {filters.map(f => (
        <span
          key={f}
          onClick={() => setFilter(f)}
          className={"filter" + (f === filter ? " selected" : "")}
        >
          {f}
        </span>
      ))}
    </div>
  );
};

const ProbaDisplay = ({ confidence }) => {
  const proba = probabilities[5 + confidence];
  return (
    <div
      className="proba"
      style={{ border: "solid 24px " + gradient[5 - confidence] }}
    >
      <span>{proba}%</span>
    </div>
  );
};

const MakeBet = () => {
  const [confidence, setConfidence] = useState(0);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const updateConfidence = incr => {
    const c = confidence + incr;
    setConfidence(c > 5 ? 5 : c < -5 ? -5 : c);
  };

  const addBet = result => {
    var transaction = db.transaction(["bets"], "readwrite");
    transaction.oncomplete = function(event) {
      console.log("All done!");
    };

    transaction.onerror = function(event) {
      console.log("ERROR");
      console.log(event.target.value);
    };

    var objectStore = transaction.objectStore("bets");
    var request = objectStore.add({ c: confidence, f: filter, r: result });
    request.onsuccess = function(event) {
      console.log("request success");
      console.log(event.target.result);
    };
    setOpen(false);
  };

  return (
    <div className="container" style={{ justifyContent: "space-between" }}>
      <FilterList filter={filter} setFilter={setFilter} />
      <ProbaDisplay confidence={confidence} />
      {!open && (
        <div className="confidence-control-container">
          <i
            className="fas fa-minus-square confidence-control"
            onClick={() => updateConfidence(-1)}
          />
          <i
            className="fas fa-check-square confidence-control"
            onClick={() => setOpen(true)}
          />
          <i
            className="fas fa-plus-square confidence-control"
            onClick={() => updateConfidence(1)}
          />
        </div>
      )}
      {open && (
        <div className="confidence-control-container">
          <i
            className="fas fa-times-circle confidence-control"
            onClick={() => addBet(false)}
          />
          <i
            className="fas fa-chevron-circle-left confidence-control"
            onClick={() => setOpen(false)}
          />
          <i
            className="fas fa-check-circle confidence-control"
            onClick={() => addBet(true)}
          />
        </div>
      )}
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

const Stats = () => {
  const [filter, setFilter] = useState("All");
  const [bets, setBets] = useState(undefined);

  var objectStore = db.transaction("bets").objectStore("bets");
  if (bets === undefined) {
    objectStore.getAll().onsuccess = event => {
      console.log("Got all bets");
      setBets(event.target.result);
    };
    return <p>Loading . . .</p>;
  }

  const stats = bets
    .filter(b => b.f === filter || filter === "All")
    .reduce((acc, val) => {
      acc[val.c + 5][0] += val.r ? 1 : 0;
      acc[val.c + 5][1] += 1;
      return acc;
    }, probabilities.map(() => [0, 0]));

  return (
    <div className="container">
      <FilterList filter={filter} setFilter={setFilter} />
      <table>
        <tbody>
          <tr>
            <th>Category</th>
            <th>Result</th>
            <th>Count</th>
          </tr>
          {stats.map(([a, c], i) => {
            return c === 0 ? null : (
              <tr key={i}>
                <td>{probabilities[i]}%</td>
                <td>{Math.round((100 * a) / c)}%</td>
                <td>{c}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Introduction = () => (
  <div className="container">
    <h2>The world isn't black & white</h2>
    <p>
      When trying to build knowledge about the world ... true or false, one
      quickly comes to realize that white or black answers are not satisfying in
      all cases. ...... grey .... one colour.... really light grey ... the sun
      will rise tomorrow ....{" "}
    </p>
    <h2>Giving probabilities to everything ?</h2>
    <p>Of course yes, there is no other way to do it.</p>
    <h2>Calibrating your belief ?</h2>
    <p>Events to which you assign 90% probability should .....</p>
    <h2>This application</h2>
    <p>
      This application is very minimalistic. Using it you will be able to log
      bets.... score for your probability judgments... You will then be able to
      see statistics about your calibration. ....{" "}
    </p>
  </div>
);

const App = () => {
  if (!IDBsupport)
    return <p>Your browser is not supported, please try another one</p>;

  const [view, setView] = useState("bets");

  return (
    <div className="App">
      <Header setView={setView} view={view} />
      {view === "intro" && <Introduction />}
      {view === "bets" && <MakeBet />}
      {view === "help" && <Help />}
      {view === "stats" && <Stats />}
    </div>
  );
};

export default App;
