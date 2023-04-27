import os

telemetry_disabled = os.environ.get("ENHANCEDOCS_TELEMETRY_DISABLED")


def telemetry() -> bool:
    return not telemetry_disabled

file_path = ".enhancedocs/output.jsonp"
api_base_url = os.environ.get("API_BASE_URL")
if api_base_url is None:
    api_base_url = 'https://api.enhancedocs.com'

api_key = os.environ.get("ENHANCEDOCS_API_KEY")
headers = {}
if api_key is not None:
    headers['authorization'] = f'Bearer {api_key}'


if telemetry():
    import sentry_sdk

    sentry_sdk.init(
        dsn="https://834f37d69b4041e59639d383c5bafd9e@o4504389022908416.ingest.sentry.io/4505087071354880",

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0
    )
