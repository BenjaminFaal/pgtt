import {get, writable} from "svelte/store";
import type {ToastNotificationProps} from "carbon-components-svelte/types/Notification/ToastNotification";

export const toasts = writable<ToastNotificationProps[]>([]);

/**
 * @see carbon-components-svelte/types/Notification/ToastNotification.d.ts
 *
 * @param props the ToastNotificationProps
 */
export function toast(props: ToastNotificationProps) {
    props.timeout = props.timeout || 5000;
    toasts.set(get(toasts).concat(props));
}