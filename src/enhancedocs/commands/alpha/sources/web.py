import click
import requests

from ....config import headers, api_base_url


@click.command()
@click.option('--project', default=None, help='The Project ID', required=True)
@click.argument('url', nargs=1, type=click.STRING, required=True)
def web(project, url):
    """Create or update a project web data source"""
    try:
        response = requests.put(f'{api_base_url}/projects/{project}/source/web',
                                json={"url": url},
                                headers=headers,
                                )
        response.raise_for_status()
        click.echo(f"✨ Site {url} finished crawling in {response.elapsed.total_seconds():.4f}s")
    except requests.exceptions.RequestException as err:
        raise click.ClickException(str(err))
