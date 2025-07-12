import { Player } from "@/components/ChannelManager";
import { ChannelUserDto } from "@/dtos/ChannelUserDto";

export class ChannelUser {
    id: string;
    currentZoneId: number = -1;
    email: string;
    name: string;
    avatar: string;
    isMuted: boolean = false;
    isLocal: boolean = false;

    private static readonly MUTED_USERS_KEY = "livekit-muted-users";
    constructor(userDto: ChannelUserDto) {
        this.id = userDto.id;
        this.currentZoneId = userDto.currentZoneId;
        this.email = userDto.email;
        this.name = userDto.name;
        this.avatar = userDto.avatar;
        this.isMuted = ChannelUser.isUserMutedInStorage(userDto.id);
    }
    private static getMutedUsersFromStorage(): Set<string> {
        try {
            const stored = localStorage.getItem(ChannelUser.MUTED_USERS_KEY);
            return new Set(stored ? JSON.parse(stored) : []);
        } catch (error) {
            console.error(
                "Error reading muted users from localStorage:",
                error,
            );
            return new Set();
        }
    }

    private static saveMutedUsersToStorage(mutedUsers: Set<string>): void {
        try {
            localStorage.setItem(
                ChannelUser.MUTED_USERS_KEY,
                JSON.stringify(Array.from(mutedUsers)),
            );
            // Trigger storage event for cross-tab sync
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: ChannelUser.MUTED_USERS_KEY,
                    newValue: JSON.stringify(Array.from(mutedUsers)),
                }),
            );
        } catch (error) {
            console.error("Error saving muted users to localStorage:", error);
        }
    }

    private static isUserMutedInStorage(userId: string): boolean {
        return ChannelUser.getMutedUsersFromStorage().has(userId);
    }

    // Instance methods for muting
    public mute(): void {
        if (!this.isMuted) {
            this.isMuted = true;
            const mutedUsers = ChannelUser.getMutedUsersFromStorage();
            mutedUsers.add(this.id);
            ChannelUser.saveMutedUsersToStorage(mutedUsers);
        }
    }

    public unmute(): void {
        if (this.isMuted) {
            this.isMuted = false;
            const mutedUsers = ChannelUser.getMutedUsersFromStorage();
            mutedUsers.delete(this.id);
            ChannelUser.saveMutedUsersToStorage(mutedUsers);
        }
    }

    public toggleMute(): void {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    // Static method to sync all users with localStorage (useful for cross-tab sync)
    public static syncAllUsersWithStorage(
        users: Map<string, ChannelUser>,
    ): boolean {
        const mutedUsers = ChannelUser.getMutedUsersFromStorage();
        let hasChanges = false;

        users.forEach((user) => {
            const shouldBeMuted = mutedUsers.has(user.id);
            if (user.isMuted !== shouldBeMuted) {
                user.isMuted = shouldBeMuted;
                hasChanges = true;
            }
        });

        return hasChanges;
    }
}
