const heroButton = document.querySelector('.private-button');
const header = document.querySelector('.header');
const colorDescription = document.querySelector('.private-text');

function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor() {
	const rgb = [];
	for (let i = 0; i < 3; i++) {
		let num = getRandomArbitrary(0, 255);
		rgb.push(num);
	}
	return rgb;
}

function valueToHex(c) {
	var hex = c.toString(16);
	return hex
}

function colorToHex(r) {
	return ('#' + valueToHex(r[0]) + valueToHex(r[1]) + valueToHex(r[2]));
}

function colorToRGB(r) {
	return `rgb(${r[0]}, ${r[1]}, ${r[2]})`;
}

heroButton.addEventListener('click', (e) => {
	e.preventDefault();
	const currentColor = getRandomColor();
	const rgb = colorToRGB(currentColor);
	const hex = colorToHex(currentColor);
	header.style.backgroundColor = hex;
	colorDescription.innerHTML = `The color you just picked is: ${rgb} and in hex it is: ${hex}.`;
})

// Setting modal window for other button

const notButton = document.querySelector('.private-link');
const modalWindow = document.querySelector('.modal');
const modalClose = document.querySelector('.modal-close-button');

notButton.addEventListener('click', (e) => {
	modalWindow.classList.toggle('active');
})

// Making grosseryBud

const grosseryLink = document.querySelector('.header-ordering');
const cartForm = document.querySelector('.cart__form');
const cartAlert = document.querySelector('.cart__alert');
const cartInput = document.getElementById('grocery');
const cartSubmit = document.querySelector('.cart__submit-btn');
const cartClear = document.querySelector('.cart__clear-btn');
const cartGrocery = document.querySelector('.cart__grocery');
const cartList = document.querySelector('.list-cart');

// Initializing some flags and variables

let editFlag = false;
let editedItemID = null;
let removedItemID = null;

// Opening and closing grossery window on click on the other place

const cartWindow = document.querySelector('.header__shopping-cart');

window.addEventListener('click', (e) => {

	const deleteBtn = e.target.closest('.list-cart__delete-btn');
	if (e.target === grosseryLink) {
		cartWindow.classList.toggle('active');
	} else if (!cartWindow.contains(e.target) && !deleteBtn ) {
		cartWindow.classList.remove('active');
	}
	
})

// Handling click events on grocery list

cartList.addEventListener('click', (e) => {
	const button = e.target.parentNode;
	const item = button.parentNode.parentNode;
	if (button.classList.contains('list-cart__edit-btn')) {

		// When edit button is clicked, we set the editFlag to true,
		// change the text of submit button to "Edit", populate the input with
		// the existing value, and store the id of the item to be edited.

		editFlag = true;
		cartSubmit.textContent = 'Edit';
		cartInput.value = item.innerText.trim();
		editedItemID = item.dataset.id;

	} else if (button.classList.contains('list-cart__delete-btn')) {

		// When delete button is clicked, we remove the item from the list,
		// and show an alert message.
		removedItemID = item.dataset.id;
		cartList.removeChild(item);
		if (cartList.children.length < 1) {
			cartGrocery.classList.remove('active');
			alertMessage('all values was deleted', 'danger');
		}
		alertMessage('value was deleted', 'danger');
		removeFromLocalStorage(removedItemID);
	}
})

// Generating unique id for the grocery item

function generateUniqueId() {
	const timestamp = new Date().getTime(); // get current time in milliseconds
	const randomNum = Math.floor(Math.random() * 10000); // generate a random number between 0 and 9999
	const uniqueId = `${timestamp}-${randomNum}`; // combine the timestamp and random number to create a unique ID
	return uniqueId;
}

// Filtering the input to allow only alphabets

cartInput.addEventListener('input', (e) => {
	const regex = /[^a-zA-Z\s\-.,?!]/g;
	if (regex.test(e.target.value)) {
		alertMessage('Only English letters', 'danger');
		e.target.value = e.target.value.replace(regex, '');
	}
});

// Handling form submission

cartForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const value = cartInput.value;
	const id = generateUniqueId();
	cartInput.value = '';
	if (!value && !editFlag) {
		// If the input is empty and we are not editing, show an alert message
		alertMessage('please enter value', 'danger');
	}
	else if (value && editFlag) {

		// If we are editing an existing item, replace the existing value with the new value
		// and show an alert message.

		editFlag = false;
		cartSubmit.textContent = 'Submit';
		const item = cartList.querySelector(`[data-id="${editedItemID}"] p`);
		if (item) {
			item.textContent = value;
			editItemInLocalStorage(editedItemID, value);
			alertMessage('value was edited', 'success');
		}
	}
	else {

		// If we are adding a new item, create a new element with the value,
		// and append it to the list. Also, show an alert message.

		addElement(id, value);
		cartGrocery.classList.add('active');
		alertMessage('value was added', 'success');
		addToLocalStorage(id, value);
	}
})

cartClear.addEventListener('click', () => {
	cartList.innerHTML = '';
	cartGrocery.classList.remove('active');
	localStorage.removeItem('list');
	alertMessage('all values was deleted', 'danger');
})

window.addEventListener('DOMContentLoaded', () => {
	setToLocalStorage();
});

function alertMessage(name, mode) {
	cartAlert.innerText = name;
	cartAlert.classList.add(mode);
	setTimeout(() => {
		cartAlert.innerText = '';
		cartAlert.classList.remove(mode);
	}, 2000)
}

function addElement(id, value) {
	const element = document.createElement('div');
	element.setAttribute('data-id', id);
	element.setAttribute('class', 'list-cart__item')
	element.innerHTML = `
		<p class="list-cart__title">${value}</p>
		<div class="list-cart__btns">
			<button class="list-cart__edit-btn">
				<img class="list-cart__edit-icon" src="img/icons/pen-to-square-solid.svg" alt="trash-can">
			</button>
			<button class="list-cart__delete-btn">
				<img class="list-cart__delete-icon" src="img/icons/trash-can-solid.svg" alt="edit-icon">
			</button>
		</div>
	`;
	cartList.appendChild(element);
}

function accessToLocalStorage() {
	let items
	if (JSON.parse(localStorage.getItem('list'))) {
		items = JSON.parse(localStorage.getItem('list'));
	} else {
		items = [];
	}
	return items;
}

function addToLocalStorage(id, value) {
	let items = accessToLocalStorage();
	let elem = { id: id, value: value };
	items.push(elem);
	localStorage.setItem('list', JSON.stringify(items));
}

function removeFromLocalStorage(id) {
	let items = accessToLocalStorage();
	items = items.filter((item) => {
		return item.id !== id;
	})
	localStorage.setItem('list', JSON.stringify(items));
	if (JSON.parse(localStorage.getItem('list')).length === 0) {
		localStorage.removeItem('list');
	}
}

function editItemInLocalStorage(id, value) {
	let items = accessToLocalStorage();
	items = items.map((item) => {
		if (item.id === id) {
			item.value = value;
		}
		return item;
	})
	localStorage.setItem('list', JSON.stringify(items));
}

function setToLocalStorage() {
	let items = accessToLocalStorage();
	items.forEach((item) => {
		addElement(item.id, item.value);
	});
	cartGrocery.classList.add('active');
}
