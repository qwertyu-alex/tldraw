import { StateNode, TLKeyboardEventInfo, TLPointerEventInfo } from '@tldraw/editor'
import { ShapeWithCrop, getTranslateCroppedImageChange } from './crop_helpers'

type Snapshot = ReturnType<TranslatingCrop['createSnapshot']>

export class TranslatingCrop extends StateNode {
	static override id = 'translating_crop'

	info = {} as TLPointerEventInfo & {
		target: 'shape'
		isCreating?: boolean
		onInteractionEnd?: string
	}

	markId = ''

	private snapshot = {} as any as Snapshot

	override onEnter(
		info: TLPointerEventInfo & {
			target: 'shape'
			isCreating?: boolean
			onInteractionEnd?: string
		}
	) {
		this.info = info
		this.snapshot = this.createSnapshot()

		this.markId = this.editor.markHistoryStoppingPoint('translating_crop')
		this.editor.setCursor({ type: 'move', rotation: 0 })
		this.updateTranslatingCroppingShape()
	}

	override onExit() {
		this.editor.setCursor({ type: 'default', rotation: 0 })
	}

	override onPointerMove = () => {
		this.updateTranslatingCroppingShape()
	}

	override onPointerUp() {
		this.complete()
	}

	override onComplete() {
		this.complete()
	}

	override onCancel() {
		this.cancel()
	}

	override onKeyDown(info: TLKeyboardEventInfo) {
		switch (info.key) {
			case 'Alt':
			case 'Shift': {
				this.updateTranslatingCroppingShape()
				return
			}
		}
	}

	override onKeyUp(info: TLKeyboardEventInfo) {
		switch (info.key) {
			case 'Enter': {
				this.complete()
				return
			}
			case 'Alt':
			case 'Shift': {
				this.updateTranslatingCroppingShape()
			}
		}
	}

	protected complete() {
		this.updateTranslatingCroppingShape()
		this.editor.setCurrentTool('select.crop.idle', this.info)
	}

	private cancel() {
		this.editor.bailToMark(this.markId)
		this.editor.setCurrentTool('select.crop.idle', this.info)
	}

	private createSnapshot() {
		const shape = this.editor.getOnlySelectedShape() as ShapeWithCrop
		return { shape }
	}

	protected updateTranslatingCroppingShape() {
		const shape = this.snapshot.shape as ShapeWithCrop

		if (!shape) return

		const { originPagePoint, currentPagePoint } = this.editor.inputs
		const delta = currentPagePoint.clone().sub(originPagePoint)
		const partial = getTranslateCroppedImageChange(this.editor, shape, delta)

		if (partial) {
			this.editor.updateShapes([partial])
		}
	}
}
