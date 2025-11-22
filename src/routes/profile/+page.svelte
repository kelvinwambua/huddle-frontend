<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { Button, TextInput, TextArea, InlineNotification } from 'carbon-components-svelte';

	const BACKEND_URL = env.PUBLIC_BACKEND_URL || 'http://localhost:8080';

	let username = '';
	let displayName = '';
	let bio = '';
	let website = '';
	let loading = false;
	let usernameAvailable: boolean | null = null;
	let checkingUsername = false;
	let notification: { show: boolean; kind: 'success' | 'error'; title: string; subtitle: string } =
		{
			show: false,
			kind: 'success',
			title: '',
			subtitle: ''
		};
	let usernameTimeout: ReturnType<typeof setTimeout>;

	async function checkUsername() {
		if (username.length < 3) {
			usernameAvailable = null;
			return;
		}

		checkingUsername = true;
		try {
			const response = await fetch(
				`${BACKEND_URL}/api/profiles/check-username?username=${encodeURIComponent(username)}`,
				{
					method: 'GET',
					credentials: 'include'
				}
			);

			const data = await response.json();
			usernameAvailable = data.available;
		} catch (error) {
			console.error('Failed to check username:', error);
		} finally {
			checkingUsername = false;
		}
	}

	function onUsernameInput() {
		clearTimeout(usernameTimeout);
		usernameTimeout = setTimeout(checkUsername, 500);
	}

	async function createProfile() {
		loading = true;
		notification.show = false;

		try {
			const response = await fetch(`${BACKEND_URL}/api/profiles`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					username,
					display_name: displayName || null,
					bio: bio || null,
					website: website || null
				})
			});

			if (response.ok) {
				notification = {
					show: true,
					kind: 'success',
					title: 'Success',
					subtitle: 'Profile created successfully!'
				};
				setTimeout(() => goto('/'), 1500);
			} else {
				const error = await response.json();
				notification = {
					show: true,
					kind: 'error',
					title: 'Error',
					subtitle: error.error || 'Failed to create profile'
				};
			}
		} catch (error) {
			notification = {
				show: true,
				kind: 'error',
				title: 'Error',
				subtitle: 'Failed to create profile. Please try again.'
			};
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="flex flex-col gap-4 w-full max-w-md px-4">
		<h1 class="text-2xl font-bold text-center mb-4">Create Your Profile</h1>

		{#if notification.show}
			<InlineNotification
				kind={notification.kind}
				title={notification.title}
				subtitle={notification.subtitle}
				hideCloseButton={false}
				on:close={() => (notification.show = false)}
			/>
		{/if}

		<TextInput
			labelText="Username *"
			placeholder="john_doe"
			bind:value={username}
			on:input={onUsernameInput}
			invalid={usernameAvailable === false}
			invalidText="Username is already taken"
			helperText={checkingUsername
				? 'Checking availability...'
				: usernameAvailable === true
					? '✓ Username is available'
					: ''}
		/>

		<TextInput labelText="Display Name" placeholder="John Doe" bind:value={displayName} />

		<TextArea labelText="Bio" placeholder="Tell us about yourself" bind:value={bio} rows={4} />

		<TextInput labelText="Website" placeholder="https://example.com" bind:value={website} />

		<Button
			class="w-full"
			disabled={loading || !username || usernameAvailable === false || username.length < 3}
			on:click={createProfile}
		>
			{loading ? 'Creating...' : 'Create Profile'}
		</Button>
	</div>
</div>
