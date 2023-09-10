var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var sentryReleaseInjectionFile = {};

var hasRequiredSentryReleaseInjectionFile;

function requireSentryReleaseInjectionFile () {
	if (hasRequiredSentryReleaseInjectionFile) return sentryReleaseInjectionFile;
	hasRequiredSentryReleaseInjectionFile = 1;
	var _global = typeof window !== "undefined" ? window : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : {};
	_global.SENTRY_RELEASE = { id: "bad15b71361b4f0ca87739e2aecf0239" };
	
	return sentryReleaseInjectionFile;
}

requireSentryReleaseInjectionFile();
//# sourceMappingURL=sentry-release-injection-file-e75cc0ec.js.map
