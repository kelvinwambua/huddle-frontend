<script lang="ts">
	import { GoogleLogo, GitHubLogo } from '@selemondev/svgl-svelte';
	import { Button, InlineNotification, InlineLoading } from 'carbon-components-svelte';
	import { env } from '$env/dynamic/public';

	let loadingGithub = false;
	let loadingGoogle = false;
	let notification: { show: boolean; kind: 'success' | 'error'; title: string; subtitle: string } =
		{
			show: false,
			kind: 'success',
			title: '',
			subtitle: ''
		};
	const BACKEND_URL = env.PUBLIC_BACKEND_URL;

	async function signIn(provider: 'github' | 'google') {
		if (provider === 'github') {
			loadingGithub = true;
		} else {
			loadingGoogle = true;
		}
		notification.show = false;
		try {
			window.location.href = `${BACKEND_URL}/auth/${provider}`;
		} catch (error) {
			loadingGithub = false;
			loadingGoogle = false;
			notification = {
				show: true,
				kind: 'error',
				title: 'Error:',
				subtitle: 'Failed to initiate sign in. Please try again.'
			};
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="flex flex-col items-center gap-4 w-full max-w-md px-4">
		<h1 class="text-base font-semibold mb-2">Sign in to your account</h1>

		{#if notification.show}
			<InlineNotification
				kind={notification.kind}
				title={notification.title}
				subtitle={notification.subtitle}
				hideCloseButton={false}
				on:close={() => (notification.show = false)}
			/>
		{/if}

		<Button
			class="w-full flex gap-2 items-center justify-center"
			disabled={loadingGithub || loadingGoogle}
			on:click={() => signIn('github')}
		>
			{#if loadingGithub}
				<InlineLoading status="active" description="Redirecting..." />
			{:else}
				<GitHubLogo width="24" height="24" />
				Sign in With GitHub
			{/if}
		</Button>

		<Button
			class="w-full flex gap-2 items-center justify-center"
			disabled={loadingGithub || loadingGoogle}
			on:click={() => signIn('google')}
		>
			{#if loadingGoogle}
				<InlineLoading status="active" description="Redirecting..." />
			{:else}
				<GoogleLogo width="24" height="24" />
				Sign in With Google
			{/if}
		</Button>
	</div>
</div>
