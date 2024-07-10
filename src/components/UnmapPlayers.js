import { updateDoc, 
         collection, 
         getDocs, 
         query, 
         where 
    } from 'firebase/firestore';
import { db } from '../utils/firebase';
const UnmapPlayers = () => {
    //unmaps the selected player's targets and assassins
    const handleUnmapping = async (revivedPlayerName, roomID) => {        
        const playerCollectionRef = collection(db, 'rooms', roomID, 'players');

        //gets the uncheckmarked player
        const playerQuery = query(playerCollectionRef, where("name", "==", revivedPlayerName));
        const playerSnapshot = await getDocs(playerQuery);
        if (playerSnapshot.empty) {
            console.error("Error unmapping player: player not found:", revivedPlayerName);
            return;
        }

        //retrieves uncheckmarked player's assassins and targets
        const playerDocRef = playerSnapshot.docs[0].ref;
        const playerData = playerSnapshot.docs[0].data();
        const playerAssassins = playerData.assassins;
        const playerTargets = playerData.targets;
        console.log('playerAssassins: ', playerAssassins);


        //removes uncheckmarked player from their assassin's targets list
        for (const player of playerAssassins) {
            const assassinQuery = query(playerCollectionRef, where("name", "==", player));
            const assassinSnapshot = await getDocs(assassinQuery);
            if (assassinSnapshot.empty) {
                return console.error("Error unmapping player: player not found:", player);
            }
            const assassinDocRef = assassinSnapshot.docs[0].ref;
            const assassinData = assassinSnapshot.docs[0].data();
            console.log('assassinData: ', assassinData);
            const assassinTargets = assassinData?.targets || [];
            console.log('assassinTargets: ', assassinTargets);
            const newTargets = assassinTargets.filter((name) => name !== revivedPlayerName);
            await updateDoc(assassinDocRef, { targets: newTargets });
        }

        //removes uncheckmarked player from their target's assassins list
        for (const player of playerTargets) {
            const targetQuery = query(playerCollectionRef, where("name", "==", player));
            const targetSnapshot = await getDocs(targetQuery);
            if (targetSnapshot.empty) {
                return console.error("Error unmapping player: player not found:", player);
            }
            const targetDocRef = targetSnapshot.docs[0].ref;
            const targetAssassins = targetSnapshot.docs[0].data().assassins;
            const newAssassins = targetAssassins.filter((name) => name !== revivedPlayerName);
            await updateDoc(targetDocRef, { assassins: newAssassins });
        }
        await updateDoc(playerDocRef, { targets: [], assassins: [] });
    };

    return handleUnmapping;
}
 
export default UnmapPlayers;