import click
import requests

from ..config import api_base_url, headers


@click.command()
@click.option('--project', default=None, help='The project ID')
@click.option("--stream", is_flag=True, show_default=True, default=False, help="Stream response")
@click.option("--chat", is_flag=True, show_default=True, default=False, help="Interactive chat")
@click.argument('question', nargs=-1, type=click.STRING)
def ask(project, chat, stream, question):
    """Ask a question to your documentation"""
    history = []
    if not question:
        if chat:
            question = click.prompt("Question", type=str)
        else:
            raise click.UsageError('Provide a question')
    url = f'{api_base_url}/ask'
    if stream:
        url = url + "/stream"
    question = " ".join(question)
    history.append(f"Human: {question}")
    params = {"question": question}
    if project:
        params['projectId'] = project

    def ask_request_history(body):
        try:
            response = requests.post(
                url,
                params=params,
                json=body,
                stream=stream
            )
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=None):
                click.echo(chunk.decode('utf-8'), nl=False)
            if chat:
                history.append(f"AI: {response.text}")
                question = click.prompt("Question", type=str)
                history.append(f"Human: {question}")
                ask_request_history({"question": question, "history": history})
            else:
                click.echo("")
        except requests.exceptions.RequestException as err:
            raise click.ClickException(str(err))

    try:
        response = requests.get(url, params=params, headers=headers, stream=stream)
        response.raise_for_status()
        if stream:
            for chunk in response.iter_content(chunk_size=None):
                click.echo(chunk.decode('utf-8'), nl=False)
            if chat:
                history.append(f"AI: {response.text}")
                question = click.prompt("Question", type=str)
                history.append(f"Human: {question}")
                ask_request_history({"question": question, "history": history})
            else:
                click.echo("")
        else:
            result = response.text
            click.echo(result)
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
