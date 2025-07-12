"use client";

import {
    useTracks,
    TrackRefContext,
    useIsMuted,
    TrackReferenceOrPlaceholder,
    AudioTrack,
    useRoomContext,
    useParticipants,
    ParticipantLoop,
    ParticipantContext,
    TrackReference,
    useRemoteParticipants,
    useTrackByName,
} from "@livekit/components-react";
import { useCallback, useEffect, useMemo } from "react";
import { RoomEvent, Track } from "livekit-client";
import { useChannelStore } from "@/store/useChannelStore";
import { ChannelUser } from "@/user/ChannelUser";
import User from "./User";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutedUsers } from "@/hooks/useMutedUsers";
import { use } from "matter";

export const UserRenderer = () => {
    const users = useChannelStore((state) => state.users);
    const userZones = useChannelStore((state) => state.userZones);
    const user = useAuthStore((state) => state.user);
    const zoneStates = useChannelStore((s) => s.zoneStates);
    const participants = useParticipants();
    const nearbyUsers = useChannelStore((s) => s.nearbyUsers);
    const remoteParticipants = useRemoteParticipants();
    
    // Use the muted users hook to handle local muting
    const { mutedUsers } = useMutedUsers();
    const videoTracks = useTracks([Track.Source.Camera], {
        // updateOnlyOn: [
        //     RoomEvent.TrackPublished,
        //     RoomEvent.TrackSubscribed,
        //     RoomEvent.TrackUnsubscribed,
        //     RoomEvent.TrackUnpublished,
        //     RoomEvent.ParticipantConnected,
        //     RoomEvent.ParticipantDisconnected,
        //     RoomEvent.TrackMuted
        // ],
        onlySubscribed: true, // Only get subscribed tracks
    });
    const audioTracks = useTracks([Track.Source.Microphone], {
        // updateOnlyOn: [
        //     RoomEvent.TrackPublished,
        //     RoomEvent.TrackSubscribed,
        //     RoomEvent.TrackUnsubscribed,
        //     RoomEvent.TrackUnpublished,
        //     RoomEvent.ParticipantConnected,
        //     RoomEvent.ParticipantDisconnected,
        //     RoomEvent.TrackMuted
        // ],
        onlySubscribed: true, // Only get subscribed tracks
    });
    const currentUserId = user?.id ?? "";
    const currentUserZoneId = userZones.get(currentUserId) ?? -1; // Default to -1 if not found
    const isCurrentUserInClosedZone =
        currentUserZoneId !== -1 && zoneStates.get(currentUserZoneId) === false;

    const videoFilterPredicate = useCallback((identity: string) => {
        const trackUserZoneId = userZones.get(identity) ?? -1; // Default to -1 if not found
        // Always show yourself
        if (identity === currentUserId) return true;

        // Case 1: Current user is in no zone (-1) or open zone - show all non-closed-zone users
        if (currentUserZoneId === -1 || !isCurrentUserInClosedZone) {
            // Show users who are either:
            // - In no zone (-1)
            // - In an open zone
            // - In the same zone as current user (if current user is in a zone)
            return (
                trackUserZoneId === -1 ||
                zoneStates.get(trackUserZoneId) !== false ||
                trackUserZoneId === currentUserZoneId
            );
        }

        // Case 2: Current user is in closed zone - only show same zone users
        return trackUserZoneId === currentUserZoneId;
    }, [userZones, currentUserId, currentUserZoneId, isCurrentUserInClosedZone, zoneStates]);

    const audioFilterPredicate = useCallback((identity: string) => {
        const trackUserZoneId = userZones.get(identity) ?? -1; // Default to -1 if not found
        // Always include your own audio
        // if (trackUserId === currentUserId) return true;
        if(mutedUsers.has(identity)) return false;
        if (nearbyUsers.has(identity)) return true;
        if (trackUserZoneId === -1) return false;

        return trackUserZoneId === currentUserZoneId;
    }, [currentUserZoneId, nearbyUsers, userZones, mutedUsers]);

    useEffect(()=> {
      remoteParticipants.forEach((participant) => {
              participant.trackPublications.forEach((track) => {
                  if (track.source === Track.Source.Camera) {
                      if (videoFilterPredicate(participant.identity)) {
                          track.setSubscribed(true);
                      } else {
                          track.setSubscribed(false);
                      }
                  }
                  if (track.source === Track.Source.Microphone) {
                      if (audioFilterPredicate(participant.identity)) {
                          track.setSubscribed(true);
                      } else {
                          track.setSubscribed(false);
                      }
                  }
              });
          });

    }, [remoteParticipants, videoFilterPredicate, audioFilterPredicate]);
    
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {participants.map((participant) => {
                // Find matching user in your Zustand store
                const user = users.get(participant.identity);
                if (!user) {
                    return null;
                }
                const trackRef =
                    videoTracks.find(
                        (t) => t.participant.identity === participant.identity,
                    ) || null;

                return (
                    <ParticipantContext.Provider
                        key={participant.identity}
                        value={participant}
                    >
                        <TrackRefContext.Provider
                            key={participant.identity}
                            value={trackRef ?? undefined}
                        >
                            <User
                                user={user}
                                // participant={participant}
                                // trackRef={trackRef}
                            />
                        </TrackRefContext.Provider>
                    </ParticipantContext.Provider>
                );
            })}

            <AudioRenderer audioTracks={audioTracks} />
        </div>
    );
    // Removed the custom useMemo function as it conflicts with React's useMemo.
};

// Separate component for audio rendering
const AudioRenderer = ({ audioTracks }: { audioTracks: TrackReference[] }) => {
    return (
        <>
            {audioTracks.map((track) => (
                <AudioTrack
                    key={`audio-${track.participant.identity}`}
                    trackRef={track}
                    // Additional audio-specific props
                />
            ))}
        </>
    );
};
