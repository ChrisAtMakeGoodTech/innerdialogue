'use strict';

(async function Init() {
	await DataManager.openDB();
	ViewManager.init();
})();