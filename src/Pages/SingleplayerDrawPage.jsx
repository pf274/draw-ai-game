import "../Components/Styles/DrawPage.css";
import Card from 'react-bootstrap/Card';
import Toolbar from '../Components/DrawPage/Toolbar.jsx';
import DrawingCanvas from '../Components/DrawPage/DrawingCanvas.jsx';
import SingleplayerGuessesModal from '../Components/Modals/SingleplayerGuessesModal.jsx';
import { useState, useMemo } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import WordDefinitionTooltip from "../Components/DrawPage/WordDefinitionTooltip";

const SingleplayerDrawPage = ({ providedPrompt }) => {
    const [showGuessesModal, setShowGuessesModal] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [guesses, setGuesses] = useState([]);
    const [prompt, setPrompt] = useState(providedPrompt || "...");
    let [showSpinner, setShowSpinner] = useState(true);
    const canvas = useMemo(() => {
        return <DrawingCanvas setShowSpinner={setShowSpinner} />;
    }, []);
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
                    <OverlayTrigger
                        placement="right"
                        trigger={['hover', 'click']}
                        onToggle={handleShowTooltip}
                        overlay={<WordDefinitionTooltip word={prompt} show={showTooltip} />}
                    >
                        <h4 id="Prompt">Prompt: {prompt}</h4>
                    </OverlayTrigger>
                </Card.Header>
                <Card.Body id="DrawPageBody">
                    <Toolbar id="toolbar" setShowGuessesModal={setShowGuessesModal} setPrompt={setPrompt} setGuesses={setGuesses} />
                    {canvas}
                </Card.Body>
            </Card>
            <SingleplayerGuessesModal show={showGuessesModal} setShow={setShowGuessesModal} guesses={guesses} prompt={prompt} />
            {showSpinner && <Spinner id="CanvasSpinner" role="status" aria-hidden="true" animation="border" />}
        </div>

    );
};

export default SingleplayerDrawPage;