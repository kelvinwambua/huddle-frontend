<script lang="ts">
	import '../app.css';
	import 'carbon-components-svelte/css/g100.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navigation />

<main>
	{@render children()}
</main>

<style>
	main {
		margin-top: 3rem;
		padding: 2rem;
	}
</style>
