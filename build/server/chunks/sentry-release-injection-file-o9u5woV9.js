var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var sentryReleaseInjectionFile = {};

var hasRequiredSentryReleaseInjectionFile;

function requireSentryReleaseInjectionFile () {
	if (hasRequiredSentryReleaseInjectionFile) return sentryReleaseInjectionFile;
	hasRequiredSentryReleaseInjectionFile = 1;
	var _global = typeof window !== "undefined" ? window : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : {};
	_global.SENTRY_RELEASE = { id: "c2156f196bc944c1a798747667270a8d" };
	
	return sentryReleaseInjectionFile;
}

requireSentryReleaseInjectionFile();
//# sourceMappingURL=sentry-release-injection-file-o9u5woV9.js.map
