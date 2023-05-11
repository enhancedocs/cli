import json
import os
import click
import requests
from sentry_sdk import capture_exception

from ..config import file_path, api_base_url, telemetry, headers


@click.command()
@click.option('--project', default=None, help='The project ID')
@click.argument('project_id', nargs=-1, required=False)
def push(project, project_id):
    """Push bundled content file to EnhanceDocs API"""

    if not os.path.exists(file_path):
        raise click.ClickException(f"File not found: {file_path}")
    params = {}
    if project_id:
        project = project_id[0]
    if project is not None:
        params['projectId'] = project
        update_project_properties(params)
    try:
        with open(file_path, 'rb') as file:
            response = requests.put(f'{api_base_url}/ingest',
                                    data=file,
                                    params=params,
                                    headers=headers,
                                    stream=True
                                    )
            response.raise_for_status()
            click.echo(f"✨ Ingestion finished in {response.elapsed.total_seconds():.4f}s")
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))


def update_project_properties(params):
    try:
        with open('package.json', 'r', encoding='utf-8') as f:
            package_json = json.load(f)
            docusaurus = package_json.get('dependencies', {}).get('@docusaurus/core')

            if docusaurus:
                body = {'name': '@docusaurus/core', 'version': docusaurus}
                requests.patch(
                    f'{api_base_url}/projects/settings',
                    json=body,
                    params=params,
                    headers=headers
                )
    except Exception as e:
        if telemetry():
            capture_exception(e)
