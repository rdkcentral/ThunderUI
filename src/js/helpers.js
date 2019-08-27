export const resolveHostnamePort = () => {
    let hostname = window.location.hostname;
    let port;

    if (window.location.host === window.location.hostname)
            port = 80;
        else
            port = window.location.host.substring(window.location.hostname.length + 1);

    if ((port !== "") && (port !== 80))
        hostname += ":" + port;

    return hostname;
}