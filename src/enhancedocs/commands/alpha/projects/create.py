import click
import uuid
import requests
import random

from ....config import headers, api_base_url


def random_name():
    word_site = "https://www.mit.edu/~ecprice/wordlist.10000"

    response = requests.get(word_site)
    word = random.choice(response.content.splitlines())
    world = word.decode('utf-8')
    return f'{world} {uuid.uuid4().hex[0:6]}'


@click.command()
@click.option('--name', default=None, help='The project name')
@click.option('--source', type=click.Choice(['WEB','MANUAL'], case_sensitive=False), help='Project initial source')
@click.option('--url', default=None, help='The project initial url', type=str, required=True)
def create(name, source, url):
    """Create a new project"""
    if name is None:
        name = random_name()
    try:
        response = requests.put(f'{api_base_url}/projects',
                                json={"name": name, "url": url},
                                headers=headers,
                                )
        response.raise_for_status()
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
    if source == "WEB":
        try:
            project = response.json()
            response = requests.put(f'{api_base_url}/projects/{project["_id"]}/source/web',
                                    json={"url": url},
                                    headers=headers,
                                    )
            response.raise_for_status()
        except requests.exceptions.RequestException as err:
            raise click.ClickException(str(err))
        click.echo(f'Project {name} has been successfully created')
