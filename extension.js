const vscode = require('vscode');
const path = require('path');

let updateInterval;
const KEY = 'theLastLaunch';
const TIME_KEY = 'possibleTimeInterval';
const TIME_KEY_VALUE = 'possibleTimeIntervalvalue';
const TIME_KEY_VALUE2 = 'possibleTimeIntervalvalue2';
const MINUTE = 1000 * 60;
const HOUR = 1000 * 60 * 60;
const DAY = 1000 * 60 * 60 * 24;
const WEEK = 1000 * 60 * 60 * 24 * 7;
const MONTH = 1000 * 60 * 60 * 24 * 7 * 30;

function showCelebration(context, interval, key, time_key_value2) {

    const now = Date.now();
	let IstheLastLaunch = context.globalState.get(key, 0);

	if (IstheLastLaunch == 0) {
        context.globalState.update(key, now);
		vscode.window.showInformationMessage('♡ Таймер обновлён. Добро пожаловать! ♡');
        return;
    }

	if (now - IstheLastLaunch <= interval) {
        vscode.window.showInformationMessage('♡ Добро пожаловать! ♡');
		return;
    }

    const panel = vscode.window.createWebviewPanel('hello_my_old_friend', '🎉 -_- 🎉',
        vscode.ViewColumn.One,
        {enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]}
    );

    const gifPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'angry-fern.gif')));
	const message = `Где вы были больше ${context.globalState.get(TIME_KEY_VALUE2, 'часа')}?`;
	
    panel.webview.html = getWebviewContent(gifPath, message);
	context.globalState.update(key, now);
}

function getWebviewContent(gifPath, message) {
	return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                html, body {
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-family: system-ui, sans-serif;
                    color: white;
                    text-shadow: 
        					0 0 2px black,
        					0 0 2px black,
        					0 0 2px black,
        					0 0 2px black;
                }
                img {
                    max-width: 400px;
                    height: auto;
                    pointer-events: none;
                }
                h1 {
                    margin-top: 20px;
                    font-size: 24px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <img src="${gifPath}" alt="-_-" />
            <h1>${message}</h1>
        </body>
        </html>
    `;
}

function setTimer(context, key, time_check){
	if (updateInterval){
		clearInterval(updateInterval);
	}
	updateInterval = setInterval(() => {
        const current = Date.now();
        context.globalState.update(key, current);
    }, time_check);
}

function defineTimeInterval(time_period){
	let timer_interval = HOUR;
	switch (time_period){
		case MINUTE: timer_interval=MINUTE; break;
		case HOUR: timer_interval=MINUTE*15; break;
	}
	return timer_interval;
}

function activate(context) {
	const time_period = context.globalState.get(TIME_KEY_VALUE, HOUR);
	showCelebration(context, time_period, KEY, TIME_KEY_VALUE2);

	let timer_interval = defineTimeInterval(time_period);
	setTimer(context, KEY, timer_interval);

	const disposable = vscode.commands.registerCommand('hello.change_interval', 
		async () => {
    		let items = [{label: "Minute", value: MINUTE, value2: 'минуты'}, 
				 		 {label: "Hour", value: HOUR, value2: 'часа'}, 
				 		 {label: "Day", value: DAY, value2: 'дня'}, 
				 		 {label: "Week", value: WEEK, value2: 'недели'},
						 {label: "Month", value: MONTH, value2: 'месяца'}];

  			let options = {
    		placeHolder: "Pick a time interval",
			canPickMany: false,};

  			const result = await vscode.window.showQuickPick(items, options);
			if (result){
  				vscode.window.showInformationMessage(`Picked interval: 1 ${result.label}.`);
				context.globalState.update(TIME_KEY, result.label);
				context.globalState.update(TIME_KEY_VALUE, result.value);
				context.globalState.update(TIME_KEY_VALUE2, result.value2);

				timer_interval = defineTimeInterval(result.value);
				setTimer(context, KEY, timer_interval);
			}
  	
});

	const disposable_0 = vscode.commands.registerCommand('hello.picked_interval', 
		function () {	
			const time_interval_message = context.globalState.get(TIME_KEY, 'Hour');
			vscode.window.showInformationMessage(`Picked interval: 1 ${time_interval_message}.`);
	});

	context.subscriptions.push(disposable, disposable_0, { dispose: () => clearInterval(updateInterval) });
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}