import click
import requests

from ..config import api_base_url, headers


@click.command()
@click.option('--project', default=None, help='The project ID')
@click.option("--stream", is_flag=True, show_default=True, default=False, help="Stream response")
@click.argument('question', nargs=-1, type=click.STRING)
def ask(project, stream, question):
    """Ask a question to your documentation"""
    if not question:
        raise click.UsageError('Provide a question')
    url = f'{api_base_url}/ask'
    if stream:
        url = url + "/stream"
    question = " ".join(question)
    params = {'question': question}
    if project:
        params['projectId'] = project
    try:
        response = requests.get(url, params=params, headers=headers, stream=stream)
        response.raise_for_status()
        if stream:
            for chunk in response.iter_content(chunk_size=None):
                click.echo(chunk.decode('utf-8'), nl=False)
            click.echo("")
        else:
            result = response.text
            click.echo(result)
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
