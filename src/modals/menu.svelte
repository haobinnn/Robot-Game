<script>
	import Button from "./button.svelte";
	import tv_man from "../assets/ui/tv man (1).gif";
	import { soundManager } from "../Sounds";

	export let message = "Robot Game!";
	export let onStart = (characterProps) => {};
	// export let onQuit = () => {};

	let characters = [
		{
			scr: tv_man,
			name: "TV man",
			descriptions: ["Faster speed", "Lower health"],
			speed: 350,
			health: 100,
			// health: 20,
			gun: "pistol",
			imgName: "character",
		},
		{
			scr: tv_man,
			name: "Skibidi man",
			descriptions: ["Lower speed", "Freezing Bullets"],
			speed: 210,
			// health: 20,
			health: 400,
			gun: "rifle",
			imgName: "character",
		},
		{
			scr: tv_man,
			name: "Toilet man",
			descriptions: ["Life steal", "Lower speed"],
			speed: 210,
			// health: 20,
			health: 150,
			gun: "shotgun",
			imgName: "character",
		},
	];

	let selected = 1;
	function select(number) {
		// console.log(number);
		selected = number;
	}
</script>

<div class="modal-backdrop">
	<div class="modal modal-skin">
		<h1>{message}</h1>
		<div class="character-carausel">
			{#each characters as character, e}
				<div
					class="character-card"
					onclick={() => {
						soundManager.play("ui_select");
						select(e);
					}}
					class:cselect={e === selected}
				>
					<img class="image" src={character.scr} alt="" />
					<p class="name">{character.name}</p>
					<div class="description">
						{#each character.descriptions as desc}
							<p>{desc}</p>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="buttons">
			<Button onClick={() => onStart(characters[selected])}>Play</Button>
			<!-- <Button onClick={onQuit}>Quit</Button> -->
		</div>
	</div>
</div>

<style lang="scss">
	.image {
		margin: 0.5em 1.75em;
		// width: 70%;
		// margin-bottom: 0;
	}
	.character-carausel {
		display: flex;
		justify-content: space-evenly;

		.character-card {
			padding: 1em;
			display: flex;
			flex-direction: column;
			/* background-color: bisque; */
			height: 12em;

			background-size: cover;
			background-image: url("../assets/ui/white modal.png");
			background-position: center;
			aspect-ratio: 253 /319;
			color: black;
			font-size: 1.5em;
			box-sizing: border-box;
			filter: brightness(0.6);

			.name {
				font-size: 1.6em;
				text-decoration: underline;
				font-family: "Monogram-italic";
			}

			.description {
				display: flex;
				flex-direction: column;
			}

			p {
				margin: 0;
			}

			&:hover,
			&.cselect {
				filter: brightness(1);
			}
		}
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* background: rgba(0, 0, 0, 0.7); */
		background-image: url("../assets/ui/modal backdrop.jpg");
		background-size: cover;
		background-position: center;
		backdrop-filter: blur(10px);

		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;

		h1 {
			margin: 0;
		}
	}

	.modal-backdrop::before {
		content: "";
		position: absolute;
		inset: 0;
		background: inherit; /* Inherit the background from the parent */
		filter: blur(10px); /* Apply the blur effect */
		z-index: -1; /* Place it behind the children */
	}

	.modal {
		/* padding: 2rem; */
		/* border-radius: 12px; */
		text-align: center;
		height: 37em;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;

		padding: 1em;
		box-sizing: border-box;
	}

	.modal-skin {
		background-size: cover;
		background-image: url("../assets/ui/Modal.png");
		background-position: center;
		aspect-ratio: 905 / 573;
	}

	.buttons {
		margin-top: 1rem;
		display: flex;
		justify-content: space-around;
	}
</style>
