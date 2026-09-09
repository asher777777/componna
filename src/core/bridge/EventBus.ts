import { CoreEventMap } from '../contracts';

type EventCallback<T> = (data: T) => void;

class TypedEventBus {
  private listeners: Map<string, Set<EventCallback<any>>> = new Map();

  /**
   * Subscribe to an event topic
   */
  subscribe<K extends keyof CoreEventMap>(
    topic: K,
    callback: EventCallback<CoreEventMap[K]>
  ): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    const topicSet = this.listeners.get(topic)!;
    topicSet.add(callback);

    // Return unsubscribe function
    return () => {
      topicSet.delete(callback);
      if (topicSet.size === 0) {
        this.listeners.delete(topic);
      }
    };
  }

  /**
   * Publish an event to all subscribers (if any exist)
   */
  publish<K extends keyof CoreEventMap>(topic: K, data: CoreEventMap[K]): void {
    const topicSet = this.listeners.get(topic);
    if (topicSet) {
      topicSet.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] Error executing subscriber for "${topic}":`, e);
        }
      });
    }
  }

  /**
   * Alias for publish
   */
  emit<K extends keyof CoreEventMap>(topic: K, data: CoreEventMap[K]): void {
    this.publish(topic, data);
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();
