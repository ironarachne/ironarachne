var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var sentryReleaseInjectionFile = {};

var hasRequiredSentryReleaseInjectionFile;

function requireSentryReleaseInjectionFile () {
	if (hasRequiredSentryReleaseInjectionFile) return sentryReleaseInjectionFile;
	hasRequiredSentryReleaseInjectionFile = 1;
	var _global = typeof window !== "undefined" ? window : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : {};
	_global.SENTRY_RELEASE = { id: "0518cba4d1d046489e695f9907f5635f" };
	
	return sentryReleaseInjectionFile;
}

requireSentryReleaseInjectionFile();
//# sourceMappingURL=sentry-release-injection-file-nUrLnAlE.js.map
