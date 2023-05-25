import { TLInstanceId, TLRecord, TLStoreSchema, TLUserId } from '@tldraw/tlschema'
import { StoreSnapshot } from '@tldraw/tlstore'
import { createDefaultTldrawEditorSchema } from './createDefaultTldrawEditorSchema'
import { createTldrawEditorStore } from './createTldrawEditorStore'

/** @public */
export function createDefaultTldrawEditorStore(
	opts = {} as {
		schema?: TLStoreSchema
		userId?: TLUserId
		instanceId?: TLInstanceId
		initialData?: StoreSnapshot<TLRecord>
	}
) {
	return createTldrawEditorStore({
		schema: opts.schema ?? createDefaultTldrawEditorSchema(),
		...opts,
	})
}
