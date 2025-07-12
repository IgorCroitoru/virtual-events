import { Participant, Track } from "livekit-client";
import { ContextMenuContent, ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../ui/context-menu";
import { Icons } from "../icons";
import { useMutedUsers } from "@/hooks/useMutedUsers";

export interface UserContextMenuProps {
    participant?: Participant;
    children?: React.ReactNode;
}

export const UserContextMenu = ({participant, children}:UserContextMenuProps) =>{
    // const microphone = participant?.getTrackPublication(Track.Source.Microphone);
    const { isMuted: isLocallyMuted, handleLocalMute } = useMutedUsers();

     if (!participant) {
        return <>{children}</>;
    }

    const handleMuteClick = () => {
        handleLocalMute(participant.identity);
    };

    return (
        <ContextMenu>
                <ContextMenuTrigger asChild>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                    <ContextMenuItem >
                        <Icons.user className="mr-2 h-4 w-4" />
                        Vezi Profilul
                    </ContextMenuItem>
                    {/* <ContextMenuItem >
                        Send Message
                    </ContextMenuItem> */}
                    <ContextMenuSeparator />
                    {!participant.isLocal && (
                        <ContextMenuItem 
                            // disabled={!microphone} 
                            onClick={handleMuteClick}
                        >
                            {isLocallyMuted(participant.identity) ? (
                                <>
                                    <Icons.mic className="mr-2 h-4 w-4" />
                                    Unmute
                                </>
                            ) : (
                                <>
                                    <Icons.micOff className="mr-2 h-4 w-4" />
                                    Mute
                                </>
                            )}
                        </ContextMenuItem>
                    )}
                    {participant.isLocal && (
                        <ContextMenuItem disabled>
                            <Icons.settings className="mr-2 h-4 w-4" />
                            Settings
                        </ContextMenuItem>
                    )}
                </ContextMenuContent>
            </ContextMenu>
    )
}