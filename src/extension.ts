import * as vscode from 'vscode';
import { MetricsStore } from './backend/core/MetricsStore';
import { ActivityTracker } from './backend/core/ActivityTracker';
import { RecapPanel } from './frontend/panels/RecapPanel';

let metricsStore: MetricsStore;
let activityTracker: ActivityTracker;

export function activate(context: vscode.ExtensionContext) {
	console.log('VS Code Wrapped is active!');

	// 1. Initialize Metrics
	metricsStore = new MetricsStore(context);
	activityTracker = new ActivityTracker(metricsStore);
	activityTracker.startTracking();

	// 2. Register Command to Show Stats
	let disposable = vscode.commands.registerCommand('vscodeWrapped.showStats', () => {
		console.log('[Extension] Command triggered: vscodeWrapped.showStats');
		RecapPanel.createOrShow(context.extensionUri, metricsStore);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(activityTracker);
}

export function deactivate() {
	if (activityTracker) {
		activityTracker.dispose();
	}
}
