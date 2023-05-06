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
    if chat and not stream:
        raise click.UsageError("--chat option can only be used with --stream")
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

    def ask_request_history(question):
        try:
            body = {"question": question, "history": history}
            response = requests.post(
                url,
                params=params,
                headers=headers,
                json=body,
                stream=stream
            )
            response.raise_for_status()
            content = ""
            for chunk in response.iter_content(chunk_size=None):
                text = chunk.decode('utf-8')
                content += text
                click.echo(text, nl=False)
            if chat:
                history.append(f"AI: {content}")
                question = click.prompt("\nQuestion", type=str)
                history.append(f"Human: {question}")
                ask_request_history(question)
            else:
                click.echo("")
        except requests.exceptions.RequestException as err:
            raise click.ClickException(str(err))

    try:
        response = requests.get(url, params=params, headers=headers, stream=stream)
        response.raise_for_status()
        if stream:
            content = ""
            for chunk in response.iter_content(chunk_size=None):
                text = chunk.decode('utf-8')
                content += text
                click.echo(text, nl=False)
            if chat:
                history.append(f"AI: {content}")
                question = click.prompt("\nQuestion", type=str)
                history.append(f"Human: {question}")
                ask_request_history(question)
            else:
                click.echo("")
        else:
            result = response.text
            click.echo(result)
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
