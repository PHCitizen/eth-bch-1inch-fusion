import { EventEmitter } from "stream";
import z from "zod";

export const OrderEventSchema = z.object({
  orderId: z.string(),
});

export const EventsSchema = z.object({
  Order: OrderEventSchema,
});

export type TEvents = z.infer<typeof EventsSchema>;
type EventEmitterType = {
  [k in keyof TEvents]: [TEvents[k]];
};

export function createEventEmitter() {
  return new EventEmitter<EventEmitterType>();
}
