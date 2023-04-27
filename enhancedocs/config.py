import os

package_name = "enhancedocs"

telemetry = os.environ.get("ENHANCEDOCS_TELEMETRY_DISABLED")
file_path = ".enhancedocs/output.jsonp"
api_base_url = os.environ.get("API_BASE_URL")
if api_base_url is None:
    api_base_url = 'https://api.enhancedocs.com'

api_key = os.environ.get("ENHANCEDOCS_API_KEY")
headers = {}
if api_key is not None:
    headers['authorization'] = f'Bearer {api_key}'
