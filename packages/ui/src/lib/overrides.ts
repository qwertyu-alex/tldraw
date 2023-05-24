import { App } from '@tldraw/editor'
import { objectMapEntries } from '@tldraw/utils'
import { useMemo } from 'react'
import { ActionsProviderProps } from './hooks/useActions'
import { ActionsMenuSchemaProviderProps } from './hooks/useActionsMenuSchema'
import { useBreakpoint } from './hooks/useBreakpoint'
import { ContextMenuSchemaProviderProps } from './hooks/useContextMenuSchema'
import { useDialogs } from './hooks/useDialogsProvider'
import { HelpMenuSchemaProviderProps } from './hooks/useHelpMenuSchema'
import { KeyboardShortcutsSchemaProviderProps } from './hooks/useKeyboardShortcutsSchema'
import { MenuSchemaProviderProps } from './hooks/useMenuSchema'
import { StylesProviderProps } from './hooks/useStylesProvider'
import { useToasts } from './hooks/useToastsProvider'
import { ToolbarSchemaProviderProps } from './hooks/useToolbarSchema'
import { ToolsProviderProps } from './hooks/useTools'
import { TranslationProviderProps, useTranslation } from './hooks/useTranslation/useTranslation'

/** @public */
export function useDefaultHelpers() {
	const { addToast, removeToast, clearToasts } = useToasts()
	const { addDialog, clearDialogs, removeDialog, updateDialog } = useDialogs()
	const breakpoint = useBreakpoint()
	const isMobile = breakpoint < 5
	const msg = useTranslation()
	return useMemo(
		() => ({
			addToast,
			removeToast,
			clearToasts,
			addDialog,
			clearDialogs,
			removeDialog,
			updateDialog,
			msg,
			isMobile,
		}),
		[
			addDialog,
			addToast,
			clearDialogs,
			clearToasts,
			msg,
			removeDialog,
			removeToast,
			updateDialog,
			isMobile,
		]
	)
}

type DefaultHelpers = ReturnType<typeof useDefaultHelpers>

export type TldrawUiOverride<Type, Helpers> = (app: App, schema: Type, helpers: Helpers) => Type

type WithDefaultHelpers<T extends TldrawUiOverride<any, any>> = T extends TldrawUiOverride<
	infer Type,
	infer Helpers
>
	? TldrawUiOverride<Type, Helpers extends undefined ? DefaultHelpers : Helpers & DefaultHelpers>
	: never

/** @public */
export interface TldrawUiOverrides {
	actionsMenu?: WithDefaultHelpers<NonNullable<ActionsMenuSchemaProviderProps['overrides']>>
	actions?: WithDefaultHelpers<NonNullable<ActionsProviderProps['overrides']>>
	contextMenu?: WithDefaultHelpers<NonNullable<ContextMenuSchemaProviderProps['overrides']>>
	helpMenu?: WithDefaultHelpers<NonNullable<HelpMenuSchemaProviderProps['overrides']>>
	menu?: WithDefaultHelpers<NonNullable<MenuSchemaProviderProps['overrides']>>
	toolbar?: WithDefaultHelpers<NonNullable<ToolbarSchemaProviderProps['overrides']>>
	keyboardShortcutsMenu?: WithDefaultHelpers<
		NonNullable<KeyboardShortcutsSchemaProviderProps['overrides']>
	>
	tools?: WithDefaultHelpers<NonNullable<ToolsProviderProps['overrides']>>
	translations?: TranslationProviderProps['overrides']
	styles?: StylesProviderProps['overrides']
}

export interface TldrawUiOverridesWithoutDefaults {
	actionsMenu?: ActionsMenuSchemaProviderProps['overrides']
	actions?: ActionsProviderProps['overrides']
	contextMenu?: ContextMenuSchemaProviderProps['overrides']
	helpMenu?: HelpMenuSchemaProviderProps['overrides']
	menu?: MenuSchemaProviderProps['overrides']
	toolbar?: ToolbarSchemaProviderProps['overrides']
	keyboardShortcutsMenu?: KeyboardShortcutsSchemaProviderProps['overrides']
	tools?: ToolsProviderProps['overrides']
	translations?: TranslationProviderProps['overrides']
	styles?: StylesProviderProps['overrides']
}

export function mergeOverrides(
	overrides: TldrawUiOverrides[],
	defaultHelpers: DefaultHelpers
): TldrawUiOverridesWithoutDefaults {
	const mergedTranslations: TranslationProviderProps['overrides'] = {}
	for (const override of overrides) {
		if (override.translations) {
			for (const [key, value] of objectMapEntries(override.translations)) {
				let strings = mergedTranslations[key]
				if (!strings) {
					strings = mergedTranslations[key] = {}
				}
				Object.assign(strings, value)
			}
		}
	}
	return {
		actionsMenu: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.actionsMenu) {
					schema = override.actionsMenu(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		actions: (app, schema) => {
			for (const override of overrides) {
				if (override.actions) {
					schema = override.actions(app, schema, defaultHelpers)
				}
			}
			return schema
		},
		contextMenu: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.contextMenu) {
					schema = override.contextMenu(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		helpMenu: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.helpMenu) {
					schema = override.helpMenu(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		menu: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.menu) {
					schema = override.menu(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		toolbar: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.toolbar) {
					schema = override.toolbar(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		keyboardShortcutsMenu: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.keyboardShortcutsMenu) {
					schema = override.keyboardShortcutsMenu(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		tools: (app, schema, helpers) => {
			for (const override of overrides) {
				if (override.tools) {
					schema = override.tools(app, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		translations: mergedTranslations,
	}
}

function useShallowArrayEquality<T extends unknown[]>(array: T): T {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => array, array)
}

export function useMergedTranslationOverrides(
	overrides?: TldrawUiOverrides[] | TldrawUiOverrides
): NonNullable<TranslationProviderProps['overrides']> {
	const overridesArray = useShallowArrayEquality(
		overrides == null ? [] : Array.isArray(overrides) ? overrides : [overrides]
	)
	return useMemo(() => {
		const mergedTranslations: TranslationProviderProps['overrides'] = {}
		for (const override of overridesArray) {
			if (override.translations) {
				for (const [key, value] of objectMapEntries(override.translations)) {
					let strings = mergedTranslations[key]
					if (!strings) {
						strings = mergedTranslations[key] = {}
					}
					Object.assign(strings, value)
				}
			}
		}
		return mergedTranslations
	}, [overridesArray])
}

export function useMergedOverrides(
	overrides?: TldrawUiOverrides[] | TldrawUiOverrides
): TldrawUiOverridesWithoutDefaults {
	const defaultHelpers = useDefaultHelpers()
	const overridesArray = useShallowArrayEquality(
		overrides == null ? [] : Array.isArray(overrides) ? overrides : [overrides]
	)
	return useMemo(
		() => mergeOverrides(overridesArray, defaultHelpers),
		[overridesArray, defaultHelpers]
	)
}
