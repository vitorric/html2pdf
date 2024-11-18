import { HTML2PDFOptions } from './types';

type QueueItem = {
  id: string;
  html2pdf: { html: string; options: HTML2PDFOptions };
};

export class Queue {
  private items: Array<QueueItem>;

  constructor() {
    this.items = [];
  }

  enqueue(item: QueueItem): void {
    if (!item.id || !item.html2pdf?.html) {
      return;
    }
    this.items.push(item);
  }

  peek(): QueueItem | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
