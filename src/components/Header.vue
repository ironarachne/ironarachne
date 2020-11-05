<template>
	<header>
		<h1>Iron Arachne</h1>
	</header>
</template>

<script>
	export default {
		name: 'Header',
		props: {}
	}
</script>

<style scoped lang="scss">
	$ironarachnegreen: #76E841;
	$tan: #5C5031;
	$gold: #FAD037;
	
	header {
		font-size: 1.75rem;
		line-height: 1.75rem;
		padding: 0.5rem 0;
	}
	
	h1 {
		color: $ironarachnegreen;
		font-weight: 700;
		text-shadow: 2px 2px 1px #000;
		-webkit-text-stroke-width: 2px;
		-webkit-text-stroke-color: #220;
		font-size: 2.5rem;
		line-height: 2.5rem;
		margin: 0;
	}
</style>