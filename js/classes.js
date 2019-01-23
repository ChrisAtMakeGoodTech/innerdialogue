'use strict';

class User {
	constructor(name, isSelf = false) {
		this.name = name;
		this.isSelf = Number(isSelf);
	}
}

class Message {
	constructor(userID, text, isFromUser, time = new Date()) {
		this.userID = userID;
		this.text = text;
		this.isFromUser = isFromUser;
		this.time = time;
	}
}