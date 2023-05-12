import { _dirname } from '../helper/ApiHelper'
import i18n from 'i18n'

i18n.configure({
  locales: ['en', 'pt'],
  directory: _dirname + '/src/locales',
  defaultLocale: 'en',
  register: global
})

export default i18n
