import { v4 as uuidv4 } from 'uuid';
import { Thread } from "./thread.class";

export class Message{
    id: string;
    time: number;
    sender: string;
    content: string;
    thread?: Thread;
    data: string;
    reactions: Reaction[];

    constructor(obj?: Partial<Message>){
        this.id = obj?.id ?? uuidv4();
        this.time = obj?.time ?? 0;
        this.sender = obj?.sender ?? '';
        this.content = obj?.content ?? '';
        this.thread = obj?.thread;
        this.data = obj?.data ?? '';
        this.reactions = obj?.reactions ?? [];
    }   
}

export class Reaction {
    counter: number;
    id: string;
    fromUser: string[];

    constructor(obj?: Partial<Reaction>) {
        this.counter = obj?.counter ?? 0;
        this.id = obj?.id ?? '';
        this.fromUser = obj?.fromUser ?? [];
    }
}

export class DateMessages {
    date: string;
    messages: Message[];

    constructor(obj?: Partial<DateMessages>) {
        this.date = obj?.date ?? '';
        this.messages = obj?.messages ?? [];
    }
}