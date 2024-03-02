import {
	EASINGS,
	HALF_PI,
	PI2,
	TLGeoShape,
	TLShapeId,
	Vec,
	getSvgPathFromPoints,
	perimeterOfEllipse,
	rng,
} from '@tldraw/editor'

import * as React from 'react'
import { ShapeFill, useDefaultColorTheme } from '../../shared/ShapeFill'
import { getStrokeOutlinePoints } from '../../shared/freehand/getStrokeOutlinePoints'
import { getStrokePoints } from '../../shared/freehand/getStrokePoints'
import { setStrokePointRadii } from '../../shared/freehand/setStrokePointRadii'
import { getSvgPathFromStrokePoints } from '../../shared/freehand/svg'

export const DrawStyleEllipse = React.memo(function DrawStyleEllipse({
	id,
	w,
	h,
	strokeWidth: sw,
	fill,
	color,
}: Pick<TLGeoShape['props'], 'w' | 'h' | 'fill' | 'color'> & {
	strokeWidth: number
	id: TLShapeId
}) {
	const theme = useDefaultColorTheme()
	const innerPath = getEllipseIndicatorPath(id, w, h, sw)
	const outerPath = getEllipsePath(id, w, h, sw)

	return (
		<>
			<ShapeFill theme={theme} d={innerPath} color={color} fill={fill} />
			<path d={outerPath} fill={theme[color].solid} strokeWidth={0} pointerEvents="all" />
		</>
	)
})

export function getEllipseStrokeOptions(strokeWidth: number) {
	return {
		size: 1 + strokeWidth,
		thinning: 0.25,
		end: { taper: strokeWidth },
		start: { taper: strokeWidth },
		streamline: 0,
		smoothing: 1,
		simulatePressure: false,
	}
}

export function getEllipseStrokePoints(
	id: string,
	width: number,
	height: number,
	strokeWidth: number
) {
	const getRandom = rng(id)

	const rx = width / 2
	const ry = height / 2
	const perimeter = perimeterOfEllipse(rx, ry)

	const points: Vec[] = []

	const start = PI2 * getRandom()
	const length = PI2 + HALF_PI / 2 + Math.abs(getRandom()) * HALF_PI
	const count = Math.max(16, perimeter / 10)

	for (let i = 0; i < count; i++) {
		const t = i / (count - 1)
		const r = start + t * length
		const c = Math.cos(r)
		const s = Math.sin(r)
		points.push(
			new Vec(
				rx * c + width * 0.5 + 0.05 * getRandom(),
				ry * s + height / 2 + 0.05 * getRandom(),
				Math.min(
					1,
					0.5 +
						Math.abs(0.5 - (getRandom() > 0 ? EASINGS.easeInOutSine(t) : EASINGS.easeInExpo(t))) / 2
				)
			)
		)
	}

	return getStrokePoints(points, getEllipseStrokeOptions(strokeWidth))
}

export function getEllipsePath(id: string, width: number, height: number, strokeWidth: number) {
	const options = getEllipseStrokeOptions(strokeWidth)
	return getSvgPathFromPoints(
		getStrokeOutlinePoints(
			setStrokePointRadii(getEllipseStrokePoints(id, width, height, strokeWidth), options),
			options
		)
	)
}

export function getEllipseIndicatorPath(
	id: string,
	width: number,
	height: number,
	strokeWidth: number
) {
	return getSvgPathFromStrokePoints(getEllipseStrokePoints(id, width, height, strokeWidth))
}
