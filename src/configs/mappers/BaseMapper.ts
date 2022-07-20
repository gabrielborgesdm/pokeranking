import objectMapper from 'object-mapper'

export default class BaseMapper {
  static map(mapStructure: any, source: any): any {
    if (Array.isArray(source)) {
      return this.mapMany(mapStructure, source)
    }
    return objectMapper(source, mapStructure)
  }

  private static mapMany(mapStructure: any, objects: any[]): any {
    const mapped = []

    if (!objects?.length) {
      return []
    }

    for (const object of objects) {
      mapped.push(objectMapper(object, mapStructure))
    }
    return mapped
  }
}
