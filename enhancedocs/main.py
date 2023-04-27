import click

from enhancedocs.config import package_name
from enhancedocs.commands.ask import ask
from enhancedocs.commands.build import build
from enhancedocs.commands.push import push


@click.group()
@click.version_option(None, *("-v", "--version"), package_name=package_name)
@click.help_option(*("-h", "--help"))
def cli():
    pass


cli.add_command(ask)
cli.add_command(build)
cli.add_command(push)


if __name__ == '__main__':
    cli()
