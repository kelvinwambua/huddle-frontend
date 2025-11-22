<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Header, HeaderUtilities, SkeletonText } from 'carbon-components-svelte';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	const BACKEND_URL = env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

	interface User {
		id: string;
		email: string;
		username: string;
		avatar_url: {
			String: string;
			Valid: boolean;
		};
		provider: {
			String: string;
			Valid: boolean;
		};
	}

	let user: User | null = null;
	let loading = true;
	let loggingOut = false;

	onMount(async () => {
		await checkAuth();
	});

	async function checkAuth() {
		try {
			const response = await fetch(`${BACKEND_URL}/api/me`, {
				credentials: 'include'
			});

			if (response.ok) {
				user = await response.json();
			} else {
				user = null;
			}
		} catch (error) {
			console.error('Failed to check authentication:', error);
			user = null;
		} finally {
			loading = false;
		}
	}

	async function logout() {
		loggingOut = true;
		try {
			const response = await fetch(`${BACKEND_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include'
			});

			if (response.ok) {
				user = null;
				goto('/auth');
			}
		} catch (error) {
			console.error('Failed to logout:', error);
		} finally {
			loggingOut = false;
		}
	}

	function login() {
		goto('/auth');
	}
</script>

<Header company="Huddle" platformName="Live Podcasts">
	<HeaderUtilities>
		{#if loading}
			<div class="px-4">
				<SkeletonText width="100px" />
			</div>
		{:else if user}
			<div class="flex items-center gap-4">
				{#if user.avatar_url.Valid}
					<img src={user.avatar_url.String} alt={user.username} class="w-8 h-8 rounded-full" />
				{/if}
				<span class="text-sm">{user.username}</span>
				<Button size="small" kind="danger" disabled={loggingOut} on:click={logout}>
					{loggingOut ? 'Logging out...' : 'Logout'}
				</Button>
			</div>
		{:else}
			<Button size="small" on:click={login}>Login</Button>
		{/if}
	</HeaderUtilities>
</Header>
