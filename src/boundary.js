import { get } from "svelte/store";
import boundary_map from "./assets/boundary-map.png";
import { currentRoom } from "./store";
import room_boundary from "./assets/rooms.png";

const boundaryImg = new Image();
boundaryImg.src = boundary_map;

const roomImg = new Image();
roomImg.src = room_boundary;

let roomData; // stores it per room
let boundaryData; // To store pixel data for collision detection

let boundaryWidth;
let boundaryHeight;

let allowedCoordinates = [];

export let rooms = {
	// basic: {
	// 	positions: [],
	// 	doorPosition: { x: 320, y: 4096, orientation: "Horizontal" },
	// 	cleared: false,
	// 	enemies: [],
	// 	x: 95, // 1px outside the colored room coords
	// 	y: 4189, //
	// 	width: 706,
	// 	height: 605,
	// 	enemiesSpawned: false,
	// 	summons: {
	// 		range: { number: 5 },
	// 	},
	// },
	// enemy_1_01: {
	// 	positions: [],
	// 	doorPosition: { x: 320, y: 2880, orientation: "Horizontal" },
	// 	cleared: false,
	// 	enemies: [],
	// 	x: 95,
	// 	y: 2935,
	// 	width: 706,
	// 	height: 605,
	// 	enemiesSpawned: false,
	// 	summons: {
	// 		range: { number: 5 },
	// 	},
	// },
	enemy_1_02: {
		positions: [],
		doorPosition: { x: 800, y: 1888 - 32 - 1, orientation: "Vertical" },
		cleared: false,
		enemies: [],
		x: 95,
		y: 1721,
		width: 706,
		height: 605,
		enemiesSpawned: false,
		summons: {
			range: { number: 5 },
		},
	},

	// bottomRight: {
	// 	positions: [],
	// 	doorPosition: { x: 2400, y: 2016, orientation: "Vertical" },
	// 	cleared: false,
	// 	enemies: [],
	// 	x: 2496,
	// 	y: 1824,
	// 	width: 1152,
	// 	height: 1056,
	// 	enemiesSpawned: false,
	// },
};

function getBoundaryData(image) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	canvas.width = image.width;
	canvas.height = image.height;
	// console.log(image.width, image.height);

	context.drawImage(image, 0, 0);

	const imageData = context.getImageData(0, 0, image.width, image.height);

	for (let y = 0; y < image.height; y += 20) {
		for (let x = 0; x < image.width; x += 20) {
			const index = (y * image.width + x) * 4; // RGBA index
			const red = imageData.data[index];
			const green = imageData.data[index + 1];
			const blue = imageData.data[index + 2];

			// Check if the pixel is white (R=255, G=255, B=255)
			if (red === 255 && green === 255 && blue === 255) {
				allowedCoordinates.push({ x, y });
			} else if (red === 255 && green === 119 && blue === 119) {
				// console.log("ADDING");
				rooms.basic.positions.push({ x, y });
			} else if (red === 230 && green === 95 && blue === 95) {
				// rgb(230, 95, 95)
				rooms.enemy_1_01.positions.push({ x, y });
			} else if (red === 177 && green === 82 && blue === 82) {
				// rgb(177, 82, 82)
				rooms.enemy_1_02.positions.push({ x, y });
			}
			// if (
			// 	!(red === 255 && green === 255 && blue === 255) &&
			// 	!(red === 0 && green === 0 && blue === 0)
			// ) {
			// 	console.log(
			// 		`Non-white/non-black pixel at (${x}, ${y}): R=${red}, G=${green}, B=${blue}`
			// 	);
			// }

			// else if (red === 47 && green === 173 && blue === 168) {
			// 	rooms.bottomRight.positions.push({ x, y });
			// }
			// } else if (red === 47 && green === 173 && blue === 168) {
			// 	rooms.bottomLeft.positions.push({ x, y });
			// }
		}
	}
	// console.log(rooms.start.positions);

	return imageData;
}

boundaryImg.onload = () => {
	boundaryData = getBoundaryData(boundaryImg);
	console.log("Boundary map loaded");
	boundaryWidth = boundaryData.width;
	boundaryHeight = boundaryData.height;
};

roomImg.onload = () => {
	getBoundaryData(roomImg);
};

export function getRandomAllowed() {
	return allowedCoordinates[
		Math.floor(Math.random() * allowedCoordinates.length)
	];
}

export function getRandomAllowedRoom() {
	console.log("CURRENT ROOM: " + get(currentRoom));
	return rooms[get(currentRoom)].positions[
		Math.floor(Math.random() * rooms[get(currentRoom)].positions.length)
	];
}

export function getAllowedCoordinates() {
	return allowedCoordinates;
}

// List of rectangles to treat as blocked: {x, y, width, height, active}
let tempBlockedRects = new Map();
let tempBlockIdCounter = 1;

export function clearAllTempBlockedRects() {
	tempBlockedRects.clear();
}

// why is there multiple (3) doors added even though we only add (2)
export function addTempBlockedRect(rect) {
	const id = tempBlockIdCounter++;
	// rect._tempBlockId = id;
	tempBlockedRects.set(id, rect);
	return id;
}

export function removeTempBlockedRect(id) {
	console.log("REMOVING TEMP BLOCKS");
	console.log(tempBlockedRects);
	tempBlockedRects.get(id).active = false;
	tempBlockedRects.delete(id);
	console.log(tempBlockedRects);
}

export function isBlocked(x, y) {
	if (!boundaryData) return false; // Boundary data not loaded yet

	// Scale the relative position to match the boundary map's resolution
	const pixelX = Math.floor(x);
	const pixelY = Math.floor(y);

	// Check if (x, y) is inside any temp blocked rectangle
	for (const rect of tempBlockedRects.values()) {
		if (
			rect.active && // Only block if active
			pixelX >= rect.x &&
			pixelX < rect.x + rect.width &&
			pixelY >= rect.y &&
			pixelY < rect.y + rect.height
		) {
			return true;
		}
	}

	// Ensure the coordinates are within bounds
	if (
		pixelX < 0 ||
		pixelX >= boundaryWidth ||
		pixelY < 0 ||
		pixelY >= boundaryHeight
	) {
		// console.log("OUT OF BOUNDS");
		return true; // Treat out-of-bounds as blocked
	}

	const index = (pixelY * boundaryWidth + pixelX) * 4; // RGBA index
	const red = boundaryData.data[index]; // Red channel

	return red === 0; // Black pixels (R=0) are blocked
}
