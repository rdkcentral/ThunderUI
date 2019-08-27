import './css/style.css'
import './css/toast.css'

import { init } from './js/core/application.js'
import { resolveHostnamePort } from './js/helpers.js'

init(process.env.HOST || resolveHostnamePort())