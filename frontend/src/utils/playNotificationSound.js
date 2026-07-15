import notificationSound from "../assets/sounds/notification.mp3.wav";

const audio = new Audio(notificationSound);
audio.preload = "auto";
export const playNotificationSound = () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
};