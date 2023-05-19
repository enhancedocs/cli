import click

from .create import create


@click.group("projects", help="Manage projects.")
def projects():
    pass


projects.add_command(create)
