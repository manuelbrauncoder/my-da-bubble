import { SafeUrl } from "@angular/platform-browser";

export class User {
    uid: string;
    email: string;
    username: string;
    createdAt: number | string;
    avatar: string;
    userChatActive: boolean;
    status: 'online' | 'offline' | 'away';
    channelJoinRequestsSent: string[];

    constructor(obj?: Partial<User>){
        this.uid = obj?.uid ?? '';
        this.email = obj?.email ?? '';
        this.username = obj?.username ?? '';
        this.createdAt = obj?.createdAt ?? 0;
        this.avatar = obj?.avatar ?? '';
        this.userChatActive = obj?.userChatActive ?? false;
        this.status = obj?.status ?? 'offline';
        this.channelJoinRequestsSent = obj?.channelJoinRequestsSent ?? [];
    }
}