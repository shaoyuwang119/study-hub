import { createCanvas } from '@napi-rs/canvas'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const TARGET_WIDTH = 400

export async function renderFirstPageToPng(
  pdfBytes: Uint8Array
): Promise<Buffer> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise
  const page = await pdf.getPage(1)

  const unscaled = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: TARGET_WIDTH / unscaled.width })

  const canvas = createCanvas(viewport.width, viewport.height)
  const context = canvas.getContext('2d')

  await page.render({
    canvas: canvas as any,
    canvasContext: context as any,
    viewport,
  }).promise

  return canvas.toBuffer('image/png')
}
