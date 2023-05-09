import click

from .utils import CustomHelpGroup
from .commands.ask import ask
from .commands.build import build
from .commands.alpha import alpha
from .commands.push import push


@click.group(cls=CustomHelpGroup)
@click.version_option(None, *("-v", "--version"), package_name="enhancedocs")
@click.help_option(*("-h", "--help"))
def cli():
    pass


cli.add_command(ask)
cli.add_command(build)
cli.add_command(alpha)
cli.add_command(push)


if __name__ == '__main__':
    cli()
