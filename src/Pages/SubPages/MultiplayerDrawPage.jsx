import "../../Components/Styles/DrawPage.css";
import Card from 'react-bootstrap/Card';
import DrawingCanvas from '../../Components/DrawPage/DrawingCanvas.jsx';
import {useState, useMemo, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';
import WordDefinitionTooltip from '../../Components/DrawPage/WordDefinitionTooltip.jsx';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const MultiplayerDrawPage = ({time, prompt, showTimer}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    let [showSpinner, setShowSpinner] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const canvas = useMemo(() => {
        return <DrawingCanvas setShowSpinner={setShowSpinner} />;
    }, []);
    function getRemainingTime(end_time) {
        const new_time = new Date().getTime();
        const seconds = Math.floor(((end_time - new_time) % (1000 * 60)) / 1000);
        return seconds;
    }
    useEffect(() => {
        let interval = setInterval(() => {
            setRemainingTime(Math.max(getRemainingTime(time), 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [time, getRemainingTime]);
    function handleShowTooltip() {
        setShowTooltip(!showTooltip);
    }
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
        }}>
            <Card id="DrawPage">
                <Card.Header id="DrawPageHeader">
                    <h1 id="title">Start Drawing!</h1>
                    {showTimer && <h2 id="timer" className="multiplayer">{time}</h2>}
                    <OverlayTrigger
                        placement="top"
                        trigger={['hover', 'click']}
                        onToggle={handleShowTooltip}
                        overlay={<WordDefinitionTooltip word={prompt} show={showTooltip} />}
                    >
                        <h4 id="Prompt">Prompt: {prompt}</h4>
                    </OverlayTrigger>                
                </Card.Header>
                <Card.Body id="DrawPageBody">
                    {canvas}
                </Card.Body>
            </Card>
            {showSpinner && <Spinner id="CanvasSpinner" role="status" aria-hidden="true" animation="border"/>}
        </div>

    );
};

export default MultiplayerDrawPage;