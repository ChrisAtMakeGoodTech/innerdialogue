'use strict';

const ViewManager = {
	activeUser: null,
	init: async function init() {
		ViewManager.userList = document.getElementById('userlist');
		ViewManager.newUserInput = document.getElementById('newUserName');
		ViewManager.addUserButton = document.getElementById('addUser');
		ViewManager.chatName = document.getElementById('chatName');
		ViewManager.sendAsName = document.getElementById('sendAsName');
		ViewManager.chatMessages = document.getElementById('chatMessages');
		ViewManager.chatWindow = document.getElementById('chat');
		ViewManager.newMessageInput = document.getElementById('newMessage');
		ViewManager.addMessageButton = document.getElementById('addMessage');
		ViewManager.sendAsUser = document.getElementById('sendAsUser');

		ViewManager.loadUserList();
		ViewManager.newUserInput.addEventListener('keydown', e => {
			if (e.key === 'Enter') ViewManager.addUser();
		});
		ViewManager.addUserButton.addEventListener('click', ViewManager.addUser);

		ViewManager.newMessageInput.addEventListener('keydown', e => {
			if (e.key === 'Enter') ViewManager.addMessage();
		});
		ViewManager.addMessageButton.addEventListener('click', ViewManager.addMessage);
	},
	renderUserList: function renderUserList(users) {
		ViewManager.userList.innerHTML = '';
		users.forEach(user => {
			const newUser = document.createElement('li');
			newUser.innerHTML = `<button data-choose-user="${user.id}"><div class="user-icon">${user.name[0]}</div> <span class="user-name">${user.name}</span></button>`;
			ViewManager.userList.appendChild(newUser);
		});
		ViewManager.userList.querySelectorAll('[data-choose-user]').forEach(el => {
			el.addEventListener('click', () => {
				ViewManager.showUserConversation(Number(el.getAttribute('data-choose-user')));
			});
		});
	},
	renderMessages: function renderMessages(messages) {
		ViewManager.chatMessages.innerHTML = '';
		messages.forEach(m => {
			const li = document.createElement('li');
			li.innerText = `${m.isFromUser ? ViewManager.activeUser.name : 'You'}: ${m.text}`;
			li.classList.add(m.isFromUser ? 'from-user' : 'from-self');
			ViewManager.chatMessages.appendChild(li);
		});
	},
	loadUserList: async function loadUserList() {
		const users = await DataManager.getUsers(false);
		ViewManager.renderUserList(users);
	},
	loadMessages: async function loadMessages(userID) {
		const messages = await DataManager.getMessages(userID);
		ViewManager.renderMessages(messages);
	},
	addUser: async function addUser() {
		const newUserName = ViewManager.newUserInput.value;
		if (newUserName) {
			ViewManager.newUserInput.value = '';
			await DataManager.addUser(new User(newUserName));
			ViewManager.loadUserList();
		}
	},
	addMessage: async function addMessage() {
		const newMessage = ViewManager.newMessageInput.value;
		if (newMessage) {
			ViewManager.newMessageInput.value = '';
			const activeUserID = Number(ViewManager.newMessageInput.getAttribute('data-active-user'));
			await DataManager.addMessage(new Message(activeUserID, newMessage, ViewManager.sendAsUser.checked));
			ViewManager.loadMessages(activeUserID);
		}
	},
	showUserConversation: async function showUserConversation(id) {
		const userData = await DataManager.getUserAndMessages(id);
		const user = userData[0];
		const messages = userData[1];

		ViewManager.activeUser = user;

		if (ViewManager.chatWindow.classList.contains('hidden')) {
			ViewManager.chatWindow.classList.remove('hidden');
		}
		ViewManager.chatName.innerText = user.name;
		ViewManager.sendAsName.innerText = user.name;
		ViewManager.sendAsUser.checked = false;
		ViewManager.renderMessages(messages);
		ViewManager.newMessageInput.value = '';
		ViewManager.newMessageInput.setAttribute('data-active-user', id);
	},
};