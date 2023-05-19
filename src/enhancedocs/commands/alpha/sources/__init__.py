import click

from .web import web


@click.group("sources", help="Manage data sources.")
def sources():
    pass


sources.add_command(web)
