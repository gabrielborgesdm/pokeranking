import { BaseDomainFields } from '../model/domain/BaseDomain'

export const getBaseDomainFieldsToHide = (): any => {
  const fields: any = {}

  Object.keys(BaseDomainFields).forEach((fieldName: string) => {
    fields[fieldName] = true
  })

  return fields
}
