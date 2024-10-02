export function isMobile() {
    return (navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ))
}

export function isVRDevice() {
    if (!navigator.xr) {
        return Promise.resolve(false);
    }
    return navigator.xr?.isSessionSupported('immersive-vr');
}
