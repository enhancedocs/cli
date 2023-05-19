import click
from .projects import projects
from .sources import sources


@click.group("alpha", help="Alpha versions of enhancedocs commands")
def alpha():
    pass


alpha.add_command(projects)
alpha.add_command(sources)
