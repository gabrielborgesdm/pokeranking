import objectMapper from 'object-mapper'

export default class BaseMapper {
  maps = {}
  mapObject(map: any, source: any): any {
    return objectMapper(source, map)
  }
}
