import click
from .projects import projects


@click.group("alpha", help="Alpha versions of enhancedocs commands")
def alpha():
    pass


alpha.add_command(projects)
