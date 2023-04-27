import click

from .config import ENVIRONMENT_VARIABLES_HELP
from .commands.ask import ask
from .commands.build import build
from .commands.push import push


class CustomHelpGroup(click.Group):
    def get_help(self, ctx):
        default_help = super().get_help(ctx)
        return f"{default_help}\n{ENVIRONMENT_VARIABLES_HELP}"


@click.group(cls=CustomHelpGroup)
@click.version_option(None, *("-v", "--version"), package_name="enhancedocs")
@click.help_option(*("-h", "--help"))
def cli():
    pass


cli.add_command(ask)
cli.add_command(build)
cli.add_command(push)


if __name__ == '__main__':
    cli()
