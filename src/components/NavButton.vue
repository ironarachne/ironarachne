<template>
	<button v-bind:class="{ active: isActive }" v-on:click="$emit('change-view', viewName)">{{ viewName }}</button>
</template>

<script>
  export default {
    name: 'NavButton',
    props: {
      isActive: Boolean,
      viewName: String
    }
  }
</script>

<style scoped lang="scss">
	$ironarachnegreen: #76E841;
	$tan: #5C5031;
	$gold: #FAD037;
	
	button {
		background: $tan;
		border-radius: 0px;
		border: 0px solid #000;
		color: white;
		font-size: 0.9rem;
		line-height: 0.9rem;
		margin: 0;
		width: 100%;
	}
	button.active {
		background: $gold;
		color: black;
	}
</style>
