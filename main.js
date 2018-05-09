function saveSettings(e) {
	browser.storage.local.set({
		apiKey: apiKey.value,
		isEnabled: isEnabled.checked
	});
}

function restoreSettings(e) {
	browser.storage.local.get("apiKey").then(
		function(result) {
			apiKey.value = result.apiKey || "";
		},
		function(error) {
			console.log(error);
		}
	);
	browser.storage.local.get("isEnabled").then(
		function(result) {
			isEnabled.checked = result.isEnabled
		},
		function(error) {
			console.log(error);
		}
	);
}

restoreSettings();
saveButton.addEventListener("click", saveSettings);