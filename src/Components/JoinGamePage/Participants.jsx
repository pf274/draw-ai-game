import Table from 'react-bootstrap/Table';

function Participants({rows}) {
    <Table>
            <thead>
                <tr style={{textAlign: "center"}}>
                    <th>#</th>
                    <th>Username</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
    </Table>
}

export default Participants;