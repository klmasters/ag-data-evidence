<script>
	// Sends the visitor to another address as soon as the page loads. A page cannot hold its own
	// <svelte:head> in Evidence (Evidence adds one), but a component can. The meta tag is written into
	// the static HTML, so it works before any script runs.
	export let to;
</script>

<svelte:head>
	<meta http-equiv="refresh" content="0; url={to}" />
</svelte:head>
