// import { useEffect, useState, useCallback } from 'react';
// import { RemoteTrackPublication, Track } from 'livekit-client';
// import { useRemoteParticipants } from '@livekit/components-react';

// // Local storage key for muted users
// const MUTED_USERS_KEY = 'livekit-muted-users';

// // Helper functions for managing muted users in localStorage
// const getMutedUsers = (): Set<string> => {
//     try {
//         const stored = localStorage.getItem(MUTED_USERS_KEY);
//         return new Set(stored ? JSON.parse(stored) : []);
//     } catch (error) {
//         console.error('Error reading muted users from localStorage:', error);
//         return new Set();
//     }
// };

// const saveMutedUsers = (mutedUsers: Set<string>) => {
//     try {
//         localStorage.setItem(MUTED_USERS_KEY, JSON.stringify(Array.from(mutedUsers)));
//     } catch (error) {
//         console.error('Error saving muted users to localStorage:', error);
//     }
// };

// export const useMutedUsers = () => {
//     const [mutedUsers, setMutedUsers] = useState<Set<string>>(getMutedUsers);
//     const remoteParticipants = useRemoteParticipants();

//     // Listen for localStorage changes (in case of multiple tabs)
//     useEffect(() => {
//         const handleStorageChange = (e: StorageEvent) => {
//             if (e.key === MUTED_USERS_KEY) {
//                 setMutedUsers(getMutedUsers());
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
//         return () => window.removeEventListener('storage', handleStorageChange);
//     }, []);

//     // Handle local muting/unmuting
//     const handleLocalMute = useCallback((participantId: string) => {
//         const participant = remoteParticipants.find(p => p.identity === participantId);
//         if (!participant) return;

//         const microphone = participant.getTrackPublication(Track.Source.Microphone);
//         if (!microphone) return;

//         const currentMutedUsers = getMutedUsers();
//         const isCurrentlyMuted = currentMutedUsers.has(participantId);
        
//         if (isCurrentlyMuted) {
//             // Unmute: remove from muted list and subscribe to audio
//             currentMutedUsers.delete(participantId);
//             if (microphone instanceof RemoteTrackPublication) {
//                 microphone.setSubscribed(true);
//             }
//         } else {
//             // Mute: add to muted list and unsubscribe from audio
//             currentMutedUsers.add(participantId);
//             if (microphone instanceof RemoteTrackPublication) {
//                 microphone.setSubscribed(false);
//             }
//         }
        
//         setMutedUsers(currentMutedUsers);
//         saveMutedUsers(currentMutedUsers);
//         // Trigger a storage event to update other components
//         window.dispatchEvent(new StorageEvent('storage', {
//             key: MUTED_USERS_KEY,
//             newValue: JSON.stringify(Array.from(currentMutedUsers))
//         }));
//     }, [remoteParticipants]);

//     // Function to mute a specific user
//     const muteUser = useCallback((participantId: string) => {
//         if (!mutedUsers.has(participantId)) {
//             const participant = remoteParticipants.find(p => p.identity === participantId);
//             if (!participant) return;

//             const microphone = participant.getTrackPublication(Track.Source.Microphone);
//             if (!microphone) return;

//             const currentMutedUsers = new Set(mutedUsers);
//             currentMutedUsers.add(participantId);
            
//             if (microphone instanceof RemoteTrackPublication) {
//                 microphone.setSubscribed(false);
//             }
            
//             setMutedUsers(currentMutedUsers);
//             saveMutedUsers(currentMutedUsers);
//             window.dispatchEvent(new StorageEvent('storage', {
//                 key: MUTED_USERS_KEY,
//                 newValue: JSON.stringify(Array.from(currentMutedUsers))
//             }));
//         }
//     }, [mutedUsers, remoteParticipants]);

//     // Function to unmute a specific user
//     const unmuteUser = useCallback((participantId: string) => {
//         if (mutedUsers.has(participantId)) {
//             const participant = remoteParticipants.find(p => p.identity === participantId);
//             if (!participant) return;

//             const microphone = participant.getTrackPublication(Track.Source.Microphone);
//             if (!microphone) return;

//             const currentMutedUsers = new Set(mutedUsers);
//             currentMutedUsers.delete(participantId);
            
//             if (microphone instanceof RemoteTrackPublication) {
//                 microphone.setSubscribed(true);
//             }
            
//             setMutedUsers(currentMutedUsers);
//             saveMutedUsers(currentMutedUsers);
//             window.dispatchEvent(new StorageEvent('storage', {
//                 key: MUTED_USERS_KEY,
//                 newValue: JSON.stringify(Array.from(currentMutedUsers))
//             }));
//         }
//     }, [mutedUsers, remoteParticipants]);

//     // Apply mute state to remote participants' audio tracks
//     useEffect(() => {
//         remoteParticipants.forEach(participant => {
//             const isMuted = mutedUsers.has(participant.identity);
//             const audioPublication = participant.getTrackPublication(Track.Source.Microphone);
            
//             if (audioPublication instanceof RemoteTrackPublication) {
//                 // If user is locally muted, unsubscribe from their audio
//                 // If user is not locally muted, subscribe to their audio
//                 if (audioPublication.isSubscribed === isMuted) {
//                     audioPublication.setSubscribed(!isMuted);
//                 }
//             }
//         });
//     }, [remoteParticipants, mutedUsers]);

//     return {
//         mutedUsers,
//         isMuted: (participantId: string) => mutedUsers.has(participantId),
//         handleLocalMute,
//         muteUser,
//         unmuteUser,
//     };
// };
