import Table from 'react-bootstrap/Table';

function Participants({rows}) {
    return (
        <Table>
            <thead>
                <tr style={{textAlign: "center"}}>
                    <th>#</th>
                    <th>Username</th>
                </tr>
            </thead>
            <tbody>{
            rows.map((row, index) => {
                return(<tr key={row.username} style={{textAlign: "center"}}>
                    <td>{index + 1}</td>
                    <td>{`${row.username}${row.isHost ? " (host)" : ""}`}</td>
                </tr>);
            })}
            </tbody>
        </Table>
    )

}

export default Participants;