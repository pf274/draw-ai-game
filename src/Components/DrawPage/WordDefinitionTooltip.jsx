import Popover from 'react-bootstrap/Popover';
import { useState, useEffect, forwardRef } from 'react';

const WordDefinitionTooltip = forwardRef(({ word }, ref) => {
    const [definition, setDefinition] = useState("...");
    useEffect(() => {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`).then(result => result.text()).then((result) => {
            try {
                const data = JSON.parse(result);
                if (data.title == "No Definitions Found") {
                    setDefinition("No Definition Found");
                } else {
                    const meanings = data[0].meanings;
                    let definitions;
                    for (const meaning of meanings) {
                        if (meaning.partOfSpeech === "noun") {
                            definitions = meaning.definitions;
                        }
                    }
                    if (definitions && definitions?.length > 0) {
                        setDefinition(definitions[0].definition);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });
    }, [word]);
    return (
        <Popover style={{ position: "absolute", right: "0%", top: "70px" }} id="DefinitionPopover">
            <Popover.Header>{word}</Popover.Header>
            <Popover.Body>{definition}</Popover.Body>
        </Popover>
    )
});

export default WordDefinitionTooltip;