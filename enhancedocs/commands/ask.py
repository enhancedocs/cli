import click
import requests

from enhancedocs.config import api_base_url, headers


@click.command()
@click.option('--project', default=None, help='The project ID')
@click.argument('question', nargs=-1, type=click.STRING)
def ask(project, question):
    """Ask a question to your documentation"""
    if not question:
        raise click.UsageError('Provide a question')
    question = " ".join(question)
    params = {'question': question}
    if project:
        params['projectId'] = project
    try:
        response = requests.get(f'{api_base_url}/ask', params=params, headers=headers)
        response.raise_for_status()
        result = response.text
        click.echo(result)
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
