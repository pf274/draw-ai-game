import Popover from 'react-bootstrap/Popover';
import {useState, useEffect} from 'react';

function WordDefinitionTooltip({word}, show) {
    const [definition, setDefinition] = useState("...");
    useEffect(() => {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`).then(result => result.text()).then((result) => {
        try {
            let data = JSON.parse(result);
            if (data.title == "No Definitions Found") {
                setDefinition("No Definition Found");
            } else {
                let meanings = data[0].meanings;
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
        // TODO: SET THE DEFINITION BASED ON THE WORD. Use overlay triggers to get the word's definition
    }, [word]);
    return(
        <Popover style={{position: "absolute", right: "0%", top: "50px"}} id="DefinitionPopover">
            <Popover.Header as="h3">{word}</Popover.Header>
            <Popover.Body>{definition}</Popover.Body>
        </Popover>
    )
}

export default WordDefinitionTooltip;