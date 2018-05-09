let pageurl = window.location.href;
let messageError = "ERROR_WRONG_USER_KEY";
let messageNotReady = "CAPCHA_NOT_READY";
let id = "";
let message = document.createElement('span');
let afterElement = null;

function checkCompletion(code, key, repeat) {
	setupTextarea();
	let http = new XMLHttpRequest();
	let url = `https://2captcha.com/res.php?key=${key}&action=get&id=${code}&json=0`;
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200){
			let response = http.responseText;
			if(response == messageNotReady){
				setTimeout(function() {
					checkCompletion(code, key, repeat);
				}, repeat)
			}else{
				setCaptchaCode(response.substring(3));
			}
		}
	}
	http.open("GET", url, true);
	http.send(null);
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function setChecked(interval){
	let check = document.createElement("img");
	check.src = browser.extension.getURL("./icons/check.png");
	check.style.marginTop = "-60px";
	check.style.marginLeft = "5px";
	check.style.position = "absolute";
	insertAfter(check, afterElement);
}

function setCaptchaCode(code) {
	let ele = document.getElementById("g-recaptcha-response");
	sendMessage("<b>SOLVED</b>");
	setChecked();
	if(ele != null){
		// uncomment this to show the textarea
		// ele.style.display = "block";
		ele.innerHTML = code;
	}
}

function setupTextarea() {
	let ele = document.getElementById("g-recaptcha-response");
	if(ele != null){
		// ele.style.display = "inline-block";
		// ele.style.zIndex = "-1";
	}
}

function setupMessageBox() {
	let image = '<img src="' + browser.extension.getURL('./icons/icon.png') + '" align="left" style="margin-right: 4px;" />';
	message.innerHTML = "<b>Solving captcha...</b>";
	let container = document.createElement('div');
	container.className = '2captcha_solver';
	container.innerHTML = image;
	container.appendChild(message);
	container.style.backgroundColor = "#F9F9F9";
	container.style.border = "1px solid #D3D3D3";
	container.style.borderTop = "none";
	container.style.borderRadius = "0 0 3px 3px";
	container.style.padding = "5px";
	container.style.boxSizing = "border-box"
	container.style.width = "302px";
	container.style.margin = "-4px 2px 0 0";

	insertAfter(container, afterElement);
	// afterElement.appendChild(message);
}

function sendMessage(str){
	message.innerHTML = str;
}

function startWatching(code, key) {
	let initial = 15000, repeat = 5000;
	setTimeout(function() {
		checkCompletion(code, key, repeat);
	}, initial);
}

function makeRequest(result){
	setupTextarea();
	sendMessage("<b>Solving captcha...</b>");
	let key = result.apiKey;
	let url = `https://2captcha.com/in.php?key=${key}&googlekey=${id}&method=userrecaptcha&soft_id=2151&pageurl=${pageurl}`;
	let http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200){
			let response = http.responseText;
			if(response == messageError){
				sendMessage("Error incorrect API key provided")
			}else{
				startWatching(response.substring(3), key);
			}
		}else if(http.readyState == 4){
			sendMessage("Error from 2captcha.com");
		}
	}
	http.open("GET", url, true);
	http.send(null);
}



browser.storage.local.get("isEnabled").then(function(result) {
	if(result.isEnabled){
		// wait till id is visible
		let checkId = setInterval(function() {
			let ele = document.getElementsByClassName('g-recaptcha');
			if(ele != null && ele[0] != undefined){
				id = ele[0].getAttribute('data-sitekey');
				afterElement = ele[0].firstElementChild
			}else{
				let frames = document.getElementsByTagName("iframe");
				for(let i = 0; i < frames.length; i++){
					let src = frames[i].getAttribute('src');
					if(src != null && src.startsWith("https://www.google.com/recaptcha")){
						id = getParameterByName("k", src);
						if(id != "" && id != null){
							afterElement = frames[i];
							break;
						}
					}
				}
			}
			if(id != "" && id != null){
				setupMessageBox();
				clearInterval(checkId);
				browser.storage.local.get("apiKey").then(makeRequest);
			}
		}, 1000);
	}
});