import { HTML2PDFOptions } from './types';
type QueueItem = {
    id: string;
    html2pdf: {
        html: string;
        options: HTML2PDFOptions;
    };
};
export declare class Queue {
    private items;
    constructor();
    enqueue(item: QueueItem): void;
    peek(): QueueItem | null;
    isEmpty(): boolean;
    size(): number;
}
export {};
