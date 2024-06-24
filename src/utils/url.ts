export function getQueryParameter(name: string): string | null {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get(name);
}