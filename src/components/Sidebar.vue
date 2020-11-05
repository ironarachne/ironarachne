<template>
	<section class="sidebar">
		<h2>Navigation</h2>
		<ul>
			<li>
				<NavButton 
				v-bind:isActive="currentViewName == 'Home'" 
				viewName="Home" 
				v-on:change-view="$emit('change-view', 'Home')"/>
			</li>
			<li><h3>Generators</h3></li>
			<li>
				<NavButton 
				v-bind:isActive="currentViewName == 'Heraldry'" 
				viewName="Heraldry" 
				v-on:change-view="$emit('change-view', 'Heraldry')"/>
			</li>
		</ul>
	</section>
</template>

<script>
	import NavButton from './NavButton.vue'
	
	export default {
		name: 'Sidebar',
		components: {
			NavButton,
		},
		props: {
			currentViewName: String
		},
		computed: {
			currentView: function() {
				return this.currentViewName.toLowerCase()
			}
		}
	}
</script>

<style scoped lang="scss">
	$ironarachnegreen: #76E841;
	$tan: #5C5031;
	$gold: #FAD037;
	
	section.sidebar {
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
		h2 {
			font-size: 1.2rem;
			line-height: 1.2rem;
		}
		border-right: 1px solid #eee;
		margin-right: 1.5rem;
	}
</style>
