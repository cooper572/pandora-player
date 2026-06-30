const ALLOWED_UI_ORIGINS = new Set([
    "https://pandora-movies.pages.dev",
    "https://pandora-movies-ak5.pages.dev",
]);

const PUBLIC_ASSET_PREFIXES = [
    "/javascript/",
    "/styling/",
    "/assets/",
];

const PUBLIC_ASSET_PATHS = new Set([
    "/favicon.ico",
    "/manifest.json",
]);

function isPublicAsset(pathname) {
    return PUBLIC_ASSET_PATHS.has(pathname) || PUBLIC_ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function requestOrigin(request) {
    const origin = request.headers.get("Origin");
    if (origin) return origin;

    const referer = request.headers.get("Referer");
    if (!referer) return null;

    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
}

export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (isPublicAsset(url.pathname)) {
        return context.next();
    }

    const origin = requestOrigin(context.request);

    if (ALLOWED_UI_ORIGINS.has(origin)) {
        return context.next();
    }

    return new Response("Forbidden", {
        status: 403,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
