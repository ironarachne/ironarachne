import type { RouteId } from '$app/types';
import type { Component } from 'svelte';

/**
 * Loads the component that renders a tool inside a panel. Loading is deferred so a workshop
 * pulls in only the tool the user asked for, rather than every generator on the site.
 */
export type ToolPanelLoader = () => Promise<{ default: Component }>;

/**
 * The panel component for each tool, keyed by the tool's catalog path. Partial because a route
 * that is not a tool has no panel, and a tool may be added to the catalog before it has one.
 */
export type ToolPanelRegistry = Partial<Record<RouteId, ToolPanelLoader>>;
