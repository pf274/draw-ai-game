import { Tab } from 'bootstrap';
import Card from 'react-bootstrap/Card';

function AboutPage() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Card style={{ width: "100%", height: "100%", opacity: "90%" }}>
                <Card.Header>
                    About
                </Card.Header>
                <Card.Body style={{ textAlign: "left" }}>
                    <h4 className='mt-3'>&emsp;&emsp;
                        Draw AI is a game based on <a href="https://www.jackboxgames.com/drawful/" target="_blank" rel="noopener noreferrer">"Drawful"</a> by
                        Jackbox Games, and Google's <a href="https://quickdraw.withgoogle.com/" target="_blank" rel="noopener noreferrer">"Quick, Draw!"</a> game.
                    </h4>
                    <h4 className='mt-3'>&emsp;&emsp;
                        The point of Google's game was to demonstrate how neural networks can learn to recognize doodles.
                        Drawful is a game that allows players to create, compare, and interpret each other's doodles.
                    </h4>
                    <h4 className='mt-3'>&emsp;&emsp;
                        {`Draw AI is a combination of these two games into a new game!
                    Players are given prompts, and an AI tries to guess their drawings.
                    The AI awards points to players depending on how well it recognizes their drawings.`}
                    </h4>
                    <h4 className='mt-3'>&emsp;&emsp;
                        {`This project is made with Node, Express, React, Ml5.js, socket.io, and particles.js.`}
                    </h4>
                </Card.Body>
            </Card>
        </div>
    )
}

export default AboutPage;