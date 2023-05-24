import { toDomPrecision } from '@tldraw/primitives'
import { TLGeoShape, TLShapeId } from '@tldraw/tlschema'
import * as React from 'react'
import { ShapeFill, getShapeFillSvg, getSvgWithShapeFill } from '../../shared/ShapeFill'
import { getColorForSvgExport } from '../../shared/getContainerColor'
import { getPerfectDashProps } from '../../shared/getPerfectDashProps'
import { getOvalPerimeter, getOvalSolidPath } from '../helpers'

export const DashStyleOval = React.memo(function DashStyleOval({
	w,
	h,
	strokeWidth: sw,
	dash,
	color,
	fill,
}: Pick<TLGeoShape['props'], 'w' | 'h' | 'dash' | 'color' | 'fill'> & {
	strokeWidth: number
	id: TLShapeId
}) {
	const d = getOvalSolidPath(w, h)
	const perimeter = getOvalPerimeter(w, h)

	const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
		perimeter < 64 ? perimeter * 2 : perimeter,
		sw,
		{
			style: dash,
			snap: 4,
			start: 'outset',
			end: 'outset',
			closed: true,
		}
	)

	return (
		<>
			<ShapeFill d={d} color={color} fill={fill} />
			<path
				d={d}
				strokeWidth={sw}
				width={toDomPrecision(w)}
				height={toDomPrecision(h)}
				fill="none"
				stroke="currentColor"
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
				pointerEvents="all"
			/>
		</>
	)
})

export function DashStyleOvalSvg({
	w,
	h,
	strokeWidth: sw,
	dash,
	color,
	isDarkMode,
	fill,
}: Pick<TLGeoShape['props'], 'w' | 'h' | 'dash' | 'color' | 'fill'> & {
	strokeWidth: number
	id: TLShapeId
	isDarkMode: boolean
}) {
	const d = getOvalSolidPath(w, h)
	const perimeter = getOvalPerimeter(w, h)

	const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
		perimeter < 64 ? perimeter * 2 : perimeter,
		sw,
		{
			style: dash,
			snap: 4,
			closed: true,
		}
	)
	const fillColor = getColorForSvgExport({ type: 'fill', color, isDarkMode })

	const strokeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	strokeElement.setAttribute('d', d)
	strokeElement.setAttribute('stroke-width', sw.toString())
	strokeElement.setAttribute('width', w.toString())
	strokeElement.setAttribute('height', h.toString())
	strokeElement.setAttribute('fill', 'none')
	strokeElement.setAttribute('stroke', fillColor)
	strokeElement.setAttribute('stroke-dasharray', strokeDasharray)
	strokeElement.setAttribute('stroke-dashoffset', strokeDashoffset)

	// Get the fill element, if any
	const fillElement = getShapeFillSvg({
		d,
		fill,
		color,
		isDarkMode,
	})

	return getSvgWithShapeFill(strokeElement, fillElement)
}
