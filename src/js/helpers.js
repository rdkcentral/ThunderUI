export const resolveHostnamePort = () => {
    let hostname = window.location.hostname;

    if (window.location.host === window.location.hostname)
        hostname += ":" + 80;
    else
        hostname += ":" + window.location.host.substring(window.location.hostname.length + 1);

    return hostname;
}