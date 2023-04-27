import json
import os
import click
import requests

from enhancedocs.config import file_path, api_base_url, headers


@click.command()
@click.option('--project', default=None, help='The project ID')
@click.argument('project_id', type=click.STRING, nargs=1, default=None)
def push(project, project_id):
    """Push bundled content file to EnhanceDocs API"""
    print(project, project_id)
    if not os.path.exists(file_path):
        raise click.ClickException(f"File not found: {file_path}")

    params = {}
    if project_id:
        params['projectId'] = project_id
    if project:
        params['project'] = project

    with open(file_path, "r") as file:
        data = json.load(file)

    try:
        response = requests.put(f'{api_base_url}/ingest', json=data, params=params, headers=headers)
        response.raise_for_status()
        click.echo("✨ Ingestion finished")
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
