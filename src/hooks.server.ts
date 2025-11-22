import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const BACKEND_URL = process.env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

const profileCache = new Map<string, { hasProfile: boolean; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

function cleanExpiredCache() {
	const now = Date.now();
	for (const [key, value] of profileCache.entries()) {
		if (value.expires < now) {
			profileCache.delete(key);
		}
	}
}

setInterval(cleanExpiredCache, 60 * 1000);

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies, fetch } = event;

	if (
		url.pathname === '/auth' ||
		url.pathname === '/profile' ||
		url.pathname.startsWith('/api') ||
		url.pathname === '/health'
	) {
		return resolve(event);
	}

	const cookieHeader = cookies
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join('; ');

	if (!cookieHeader) {
		return resolve(event);
	}

	const cached = profileCache.get(cookieHeader);
	if (cached && cached.expires > Date.now()) {
		if (!cached.hasProfile) {
			throw redirect(307, '/profile');
		}
		return resolve(event);
	}

	try {
		const meResponse = await fetch(`${BACKEND_URL}/api/me`, {
			headers: {
				cookie: cookieHeader
			}
		});

		if (meResponse.ok) {
			const profileResponse = await fetch(`${BACKEND_URL}/api/profiles/me`, {
				headers: {
					cookie: cookieHeader
				}
			});

			const hasProfile = profileResponse.ok;

			profileCache.set(cookieHeader, {
				hasProfile,
				expires: Date.now() + CACHE_DURATION
			});

			if (!hasProfile) {
				throw redirect(307, '/profile');
			}
		}
	} catch (error) {
		if (error instanceof Response && error.status === 307) {
			throw error;
		}
		console.error('Auth check failed:', error);
	}

	return resolve(event);
};
