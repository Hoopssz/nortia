import raw from '../data/chile-regions.json'

interface ChileRegionsData {
  order: number[]
  name: Record<string, string>
  national: { viewBox: string; paths: Record<string, string> }
  indiv: Record<string, string>
}

const data = raw as ChileRegionsData

export const regionOrder = data.order
export const regionNames = data.name
export const nationalMapViewBox = data.national.viewBox
export const nationalMapPaths = data.national.paths
export const regionSilhouettes = data.indiv

export const NUBLE_CODE = 16
