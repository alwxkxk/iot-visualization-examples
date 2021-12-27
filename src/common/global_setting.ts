import './common.css'
import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://4ab883bdc9724536b9089ab2c3b4a2e4@o211285.ingest.sentry.io/1442492',

    // Alternatively, use `process.env.npm_package_version` for a dynamic release version
    // if your build tool supports it.
    // release: "my-project-name@2.3.12",
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0

  })
}
