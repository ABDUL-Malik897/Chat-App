export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
};

export const showBrowserNotification = (title,body,icon) => {

    if (Notification.permission !== "granted") return;
    const notification = new Notification(title, {
        body,
        icon
    });
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
};