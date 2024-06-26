import React, { useState, useEffect } from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Flex,
} from '@chakra-ui/react';
import { db } from '../utils/firebase';
import {
    orderBy,
    query,
    collection,
    where,
    onSnapshot,
} from "firebase/firestore";

const AlivePlayersList = (props) => {
    const roomID = props.roomID; // Get the ID of the room that this component is displaying

    const playerCollectionRef = collection(db, 'rooms', roomID, 'players'); // This takes us to the players folder

    // Construct a query that gets all players in the room that are still alive, sorted by score
    const playerAlivePlayersQuery = query(
        playerCollectionRef,
        where("isAlive", "==", true),
        orderBy("score", "desc")
    );

    // Initialize state to keep track of the current list of players
    const [players, setPlayers] = useState([]); // array of player objects

    // When the component mounts, subscribe to the query and update the state whenever it changes
    useEffect(() => {

        // subscribe to changes in the query results
        const unsubscribe = onSnapshot(playerAlivePlayersQuery, (snapshot) => {

            // Get the updated list of players from the snapshot
            const updatedPlayers = snapshot.docs.map((doc) => ({
                name: doc.data().name,
                score: doc.data().score,
                targets: doc.data().targets,
                assassins: doc.data().assassins
            }));
            // Update the state with the new values
            setPlayers(updatedPlayers);
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }, []); // empty dependency array means this effect will only run when the component mounts


    if (players.length === 0) {
        return null;
    }
    
    return (
        <div>
            <Flex >
            <TableContainer >
                <Table variant='simple' colorScheme='teal' size='md' >
                    <TableCaption placement='top' >Alive Players List</TableCaption>
                    <Thead>
                        <Tr key='header'>
                            <Th>Name</Th>
                            <Th>Score</Th>
                            <Th>Targets</Th>
                            <Th>Assassins</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {players.map((player, index) => (
                            <Tr key={index}>
                                <Td>{player.name}</Td>
                                <Td>{player.score}</Td>
                                <Td>{player.targets.join(", ")}</Td>
                                <Td>{player.assassins.join(", ")}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            </Flex>
        </div>
    );
};

export default AlivePlayersList;
