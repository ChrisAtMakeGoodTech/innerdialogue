'use strict';

(async function Init() {
	await DataManager.openDB();
	ViewManager.init();
})();

(function installSW() {
	if (!navigator.serviceWorker) return;

	if (!navigator.serviceWorker.controller) {
		navigator.serviceWorker.register('sw.js', {
			scope: './'
		});
	}
}());