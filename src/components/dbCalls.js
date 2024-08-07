import { db } from '../utils/firebase';
import { collection, 
         getDocs, 
         query, 
         where,
         doc,
         getDoc,
         updateDoc,
         addDoc,
         orderBy,
         deleteDoc,
    } from 'firebase/firestore';
import UnmapPlayers from './UnmapPlayers';

//fetches all players from database
const fetchAllPlayersForRoom = async (roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerSnapshot = await getDocs(playerCollectionRef);
        return playerSnapshot.docs.map(doc => doc.data().name);
    }
    catch (error) {
        console.error('Error fetching all players: ', error);
    }
}

//fetch all players by living status from database
const fetchPlayersByStatusForRoom = async (isAlive, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('isAlive', '==', isAlive));
        const playerSnapshot = await getDocs(playerQuery);
        return playerSnapshot.docs.map(doc => doc.data().name);
    }
    catch (error) {
        console.error('Error fetching alive players: ', error);
    }
}
   
//fetch all tasks from database
const fetchAllTasksForRoom = async (roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        const taskSnapshot = await getDocs(taskCollectionRef);
        return taskSnapshot.docs.map(doc => doc.data());
    }
    catch (error) {
        console.error('Error fetching all tasks: ', error);
    }
}

//fetch all logs from database
const fetchAllLogsForRoom = async (roomID) => {
    try {
        const docRef = doc(db, 'rooms', roomID);
        const docSnapshot = await getDoc(docRef);
        return docSnapshot.data().logs;
    }
    catch (error) {
        console.error('Error fetching all logs: ', error);
    }
}

//add new log to database
const updateLogsForRoom = async (newLog, roomID) => {
    try {
        const date = new Date();
        const time = date.toLocaleTimeString();
        const docRef = doc(db, 'rooms', roomID);
        const docSnapshot = await getDoc(docRef);
        const currLogs = docSnapshot.data().logs;
        const newAddition = {
            time: time,
            log: newLog
        }
        const newLogs = [...currLogs, newAddition];
        await updateDoc(docRef, { logs: newLogs });
        return newLogs;
    }
    catch (error) {
        console.error("Error updating logList: ", error);
    }
}

//fetches a player's targets from database
const fetchTargetsForPlayer = async (playerName, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', playerName));
        const playerSnapshot = await getDocs(playerQuery);
        const playerTargets = playerSnapshot.docs[0].data().targets;
        return playerTargets;
    }    
    catch (error) {
        console.error('Error fetching player targets: ', error);
    }
}

//fetches all tasks by completion from database
const fetchTasksByCompletionForRoom = async (isComplete, roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        const taskQuery = query(taskCollectionRef, where ('isComplete', '==', isComplete));
        const taskSnapshot = await getDocs(taskQuery);
        return taskSnapshot;
    }
    catch (error) {
        console.error('Error fetching active tasks: ', error);
    }
}

//fetches a task's data from database
const fetchTaskForRoom = async (taskID, roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        const taskRef = doc(taskCollectionRef, taskID);
        const taskSnapshot = await getDoc(taskRef);
        return taskSnapshot.data();
    }
    catch (error) {
        console.error('Error fetching task: ', error);
    }
}

//updates player's score
const updatePointsForPlayer = async (player, points, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', player));
        const playerSnapshot = await getDocs(playerQuery);
        const playerdoc = playerSnapshot.docs[0].ref;
        const playerScore = parseInt(playerSnapshot.docs[0].data().score);
        const newPoints = points + playerScore;
        await updateDoc(playerdoc, { score: newPoints });
    }
    catch (error) {
        console.error('Error updating player score: ', error);
    }
}

//updates the 'isAlive' field of a player
const updateIsAliveForPlayer = async (player, isAlive, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', player));
        const playerSnapshot = await getDocs(playerQuery);
        const playerdoc = playerSnapshot.docs[0].ref;
        await updateDoc(playerdoc, { isAlive: isAlive });
    }
    catch (error) {
        console.error('Error reviving player: ', error);
    }
}

//marks task as completed
const updateIsCompleteToTrueForTask = async (taskID, roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        const taskDocRef = doc(taskCollectionRef, taskID);
        await updateDoc(taskDocRef, { isComplete: true });
    }
    catch (error) {
        console.error('Error completing task: ', error);
    }
}

//updates the 'completedBy' field of a task
const updateCompletedByForTask = async (taskDocRef, checkedPlayers) => {
    try {
        await updateDoc(taskDocRef, { completedBy: checkedPlayers });
    }
    catch (error) {
        console.error('Error updating completedBy: ', error);
    }
}

const addTaskForRoom = async (task, roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        await addDoc(taskCollectionRef, task);
    }
    catch (error) {
        console.error('Error adding task: ', error);
    }
}

//check if task title already exists in database
const checkForTaskDupesForRoom = async (task, roomID) => {
    try {
        const taskCollectionRef = collection(db, 'rooms', roomID, 'tasks');
        const taskQuery = query(taskCollectionRef, where('title', '==', task.title));
        const taskSnapshot = await getDocs(taskQuery);
        if (taskSnapshot.empty) {
            return false;
        }
        else {
            return true;
        }
    }
    catch (error) {
        console.error('Error checking for task dupes: ', error);
    }
}

//returns a query of alive players in descending order of score
const fetchAlivePlayersQueryByDescendPointsForRoom = (roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        return query(playerCollectionRef, 
                     where('isAlive', '==', true), 
                     orderBy('score', 'desc')
                );
    }
    catch (error) {
        console.error('Error fetching alive players: ', error);
    }
}

//returns document of player
const fetchPlayerForRoom = async (playerName, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', playerName));
        const playerSnapshot = await getDocs(playerQuery);
        if (playerSnapshot.empty) {
            throw new Error('Player not found');
        }
        else {
            return playerSnapshot.docs[0];
        }
    }
    catch (error) {
        console.error('Error fetching player: ', error);
    }
}

//resets a player's score, targets, and assassins, and turns alive status to false
//and unmaps their targets and assassins
const killPlayerForRoom = async (target, roomID) => {
    const unmapPlayers = UnmapPlayers();
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const targetQuery = query(playerCollectionRef, where('name', '==', target));
        const targetSnapshot = await getDocs(targetQuery);
        const targetDoc = targetSnapshot.docs[0].ref;
        await unmapPlayers(target, roomID);
        await updateDoc(targetDoc, { 
            score: 0, 
            isAlive: false 
        });
    }
    catch (error) {
        console.error('Error killing player: ', error);
    }
}

//add player to database
const addPlayerForRoom = async (player, roomID) => {
    const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
    const lowercaseName = player.toLowerCase();
    //check if player already exists
    const playerQuery = query(playerCollectionRef, where('name', '==', lowercaseName));
    const playerSnapshot = await getDocs(playerQuery);
    if (!playerSnapshot.empty) {
        throw new Error('Player already exists');
    }
    //adds if not
    addDoc(playerCollectionRef, {
        name: player,
        nameLowerCase: lowercaseName,
        isAlive: true,
        score: 10,
        targets: [],
        assassins: []
    })
    .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
    })
    .catch((error) => {
        console.error('Error adding player: ', error);
    });
}

//removes player from database
const removePlayerForRoom = async (player, roomID) => {
    const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
    const playerQuery = query(playerCollectionRef, where('name', '==', player));
    const playerSnapshot = await getDocs(playerQuery); 
    //returns error if player not found
    if (playerSnapshot.empty) throw new Error('Player not found');
    try {
        const docRef = playerSnapshot.docs[0].ref;
        await deleteDoc(docRef);
    }
    catch (error) {
        console.error('Error removing player: ', error);
    }
}

//dupates assassins of player in database
const updateAssassinsForPlayer = async (player, assassins, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', player));
        const playerSnapshot = await getDocs(playerQuery);
        const playerdoc = playerSnapshot.docs[0].ref;
        await updateDoc(playerdoc, { assassins: assassins });
    }
    catch (error) {
        console.error('Error updating player assassins: ', error);
    }
}

//updates targets of player in database
const updateTargetsForPlayer = async (player, targets, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', player));
        const playerSnapshot = await getDocs(playerQuery);
        const playerdoc = playerSnapshot.docs[0].ref;
        await updateDoc(playerdoc, { targets: targets });
    }
    catch (error) {
        console.error('Error updating player targets: ', error);
    }
}

//fetches player's assassins
const fetchAssassinsForPlayer = async (player, roomID) => {
    try {
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');
        const playerQuery = query(playerCollectionRef, where('name', '==', player));
        const playerSnapshot = await getDocs(playerQuery);
        const playerAssassins = playerSnapshot.docs[0].data().assassins;
        return playerAssassins;
    }
    catch (error) {
        console.error('Error fetching player assassins: ', error);
    }
}

const fetchReferenceForTask = async (taskID, roomID) => {
    console.log('fetching task: ', taskID);
    try {
        const taskRef = doc(db, 'rooms', roomID, 'tasks', taskID);
        const taskSnapshot = await getDoc(taskRef);
        if (taskSnapshot.exists()) {
            return taskRef;
        }
        else {
            throw new Error('Task not found');
        }
    }
    catch (error) {
        throw new Error('Error fetching task: ', error);
    }
}

export { 
    fetchAllPlayersForRoom,
    fetchPlayersByStatusForRoom,
    fetchAllTasksForRoom,
    fetchAllLogsForRoom,
    updateLogsForRoom,
    fetchTargetsForPlayer,
    fetchTasksByCompletionForRoom,
    fetchTaskForRoom,
    updatePointsForPlayer,
    updateIsAliveForPlayer,
    updateIsCompleteToTrueForTask,
    updateCompletedByForTask,
    addTaskForRoom,
    checkForTaskDupesForRoom,
    fetchAlivePlayersQueryByDescendPointsForRoom,
    fetchPlayerForRoom,
    killPlayerForRoom,
    addPlayerForRoom,
    removePlayerForRoom,
    updateAssassinsForPlayer,
    updateTargetsForPlayer,
    fetchAssassinsForPlayer,
    fetchReferenceForTask
};