'use strict';

const dbVersion = 1;
const STORES = {
	USERS: 'users',
	MESSAGES: 'messages'
};

const DataManager = {
	db: null,
	openDB: async function openDB() {
		return new Promise((resolve, reject) => {
			let upgraded = false;
			const request = indexedDB.open('InnerDialogueDB', dbVersion);
			request.onerror = e => {
				reject(e);
			};
			request.onupgradeneeded = e => {
				DataManager.runUpgrade(e.target.result);
				upgraded = true;
			};
			request.onsuccess = e => {
				DataManager.runSuccess(e.target.result);
				resolve(upgraded);
			};
		});
	},
	addDB: function addDB(db) {
		if (!DataManager.db) {
			DataManager.db = db;
			db.onerror = function (ev) {
				console.error('DB error', ev);
			};
		}
	},
	runSuccess: function runSuccess(db) {
		DataManager.addDB(db);
	},
	runUpgrade: function runUpgrade(db) {
		DataManager.addDB(db);
		const userStore = DataManager.db.createObjectStore(STORES.USERS, {
			keyPath: 'id',
			autoIncrement: true,
		});
		userStore.createIndex('isSelf', 'isSelf');
		userStore.add(new User('You', true));

		const messageStore = DataManager.db.createObjectStore(STORES.MESSAGES, {
			keyPath: 'id',
			autoIncrement: true,
		});
		messageStore.createIndex('userID', 'userID');
	},
	getUser: async function getUser(id) {
		return new Promise((resolve, reject) => {
			const userStore = DataManager.db
				.transaction(STORES.USERS, 'readonly')
				.objectStore(STORES.USERS);

			const request = userStore.get(id);
			request.onsuccess = function (e) {
				resolve(e.target.result);
			};
			request.onerror = function (e) {
				reject(e);
			};
		});
	},
	getMessages: async function getMessages(id) {
		return new Promise((resolve, reject) => {
			const messageStore = DataManager.db
				.transaction(STORES.MESSAGES, 'readonly')
				.objectStore(STORES.MESSAGES);

			const index = messageStore.index('userID');

			const request = index.getAll(id);
			request.onsuccess = function (e) {
				resolve(e.target.result || []);
			};
			request.onerror = function (e) {
				reject(e);
			};
		});
	},
	getUserAndMessages: async function getUser(id) {
		return Promise.all([DataManager.getUser(id), DataManager.getMessages(id)]);
	},
	getUsers: async function getUsers(isSelf = null) {
		return new Promise((resolve, reject) => {
			const userStore = DataManager.db
				.transaction(STORES.USERS, 'readonly')
				.objectStore(STORES.USERS);

			let request = null;
			if (typeof isSelf === 'boolean') {
				const index = userStore.index('isSelf');
				request = index.getAll(Number(isSelf));
			} else {
				request = userStore.getAll();
			}

			if (request) {
				request.onsuccess = function (e) {
					resolve(e.target.result || []);
				};
				request.onerror = function (e) {
					reject(e);
				};
			} else {
				reject('request is null');
			}
		});
	},
	addUser: async function addUser(user) {
		if (!user || !(user instanceof User)) {
			return Promise.reject('No username');
		}

		return new Promise((resolve, reject) => {
			const transaction = DataManager.db.transaction(STORES.USERS, 'readwrite');
			transaction.onerror = e => reject(e);
			const userStore = transaction.objectStore(STORES.USERS);
			const request = userStore.add(user);
			request.onsuccess = e => resolve(e.target.result);
			request.onerror = e => reject(e);
		});
	},
	addMessage: async function addMessage(message) {
		if (!message || !(message instanceof Message)) {
			return Promise.reject('No message');
		}

		return new Promise((resolve, reject) => {
			const transaction = DataManager.db.transaction(STORES.MESSAGES, 'readwrite');
			transaction.onerror = e => reject(e);
			const userStore = transaction.objectStore(STORES.MESSAGES);
			const request = userStore.add(message);
			request.onsuccess = e => resolve(e.target.result);
			request.onerror = e => reject(e);
		});
	},
};