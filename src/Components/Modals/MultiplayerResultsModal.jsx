import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Capitalize } from '../GameParts';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { socketIAmReady } from '../SocketCommands';

function ResultsTable({rows}) {
    return (
      <Table responsive>
        <thead>
          <tr style={{textAlign: "center"}}>
            {rows.sort((a, b) => b.points - a.points).map((row, index) => (
              <th key={index}>{row.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {rows.sort((a, b) => {return b.points - a.points}).map((row, index) => (
              <td key={index}>
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexWrap: "wrap"}}>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <p style={{margin: 0}}>{`${row.username}`}</p>
                        <p style={{margin: 0}}>Points: {row.points}</p>
                        <p style={{margin: 0}}>Total Points: <strong>{row.totalPoints}</strong></p>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 150,
                            height: 250,
                            margin: 0,
                        }}>
                            <img style={{
                                maxWidth: "100%",
                                maxHeight: "100%"
                            }} src={row.picture} />
                        </div>
                        <DropdownButton title="See guesses  " drop="centered">
                            {row.results.map((guess, index) => {
                            return (
                                <Dropdown.Item
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        color: row.points === (10 - index) * 100 ? "#00AAAA": "#000000"
                                    }}
                                    id={guess.label}
                                >
                                    <p
                                        style={{
                                            margin: "0px",
                                            padding: "0px"
                                        }}
                                    >
                                        {`${Capitalize(guess.label.replace(/_/g, " "))}`}
                                    </p>
                                    <p
                                        style={{
                                            margin: "0px",
                                            padding: "0px",
                                            flex: 1,
                                            textAlign: "right",
                                            marginLeft: "1em"
                                        }}
                                    >
                                        {`${Math.floor(guess.confidence * 10000) / 100}%`}
                                    </p>
                                </Dropdown.Item>);
                            })}
                            </DropdownButton>
                        </div>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </Table>
    );
  }


function MultiplayerResultsModal({show, playersReady, ready, participating, animation, setShow, rows, setRound, round, isGameOver, setGameRunning, gameRunning, isHost, setShowWinnerModal, setReady}) {
    function handleProceed() {
        if (isGameOver) {
            setShowWinnerModal(true);
            setShow(false);
        } else {
            setTimeout(() => {
                setRound(round => round + 1);
            }, 1400);
            setGameRunning(true);
        }
    }
    function handleReady() {
        setReady(true);
    }
    function handleClose() {
        setShow(false);
    }
    let uniqueRows = [];
    for (const row of rows) {
        if (uniqueRows.map(row => row.username).includes(row.username) === false) {
            uniqueRows.push(row);
        }
    }
    
    return (
        <Modal
            show={show}
            fullscreen={!participating}
            animation={animation}
            onHide={handleClose}
            id="MultiplayerResultsModal"
            backdrop="static"
            keyboard={false}
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                overscrollBehavior: "none",
                touchAction: "pan-right pan-left",
                // overflowY: "hidden",
            }}>
            <Modal.Header style={{display: "flex", justifyContent: "center"}}>
                {!isGameOver && <h1>{`Round ${round + 1}`}</h1>}
                {isGameOver && <h1>Game Over!</h1>}
            </Modal.Header>
            <Modal.Body>
                <ResultsTable rows={uniqueRows} />
            </Modal.Body>
            <Modal.Footer style={{justifyContent: "center"}}>
                {isHost && 
                    <div>
                        <Button size={!participating ? "lg" : "normal"} disabled={gameRunning} onClick={handleProceed}>{isGameOver ? "End Game" : "Next Round"}</Button>
                        {(!isGameOver) && <p>{`${playersReady} Player${playersReady !== 1 ? "s" : ""} Ready`}</p>}
                    </div>
                }
                {(!isHost && !isGameOver) && <Button size={!participating ? "lg" : "normal"} disabled={gameRunning || ready} onClick={handleReady}>Ready!</Button>}
                {(!isHost && isGameOver) && <Button size={!participating ? "lg": "normal"} disabled={gameRunning || ready} onClick={handleProceed}>See Winner</Button>}
            </Modal.Footer>
        </Modal>
    );
}

export default MultiplayerResultsModal;