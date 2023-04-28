import os
import click
import json
import time

from datetime import timedelta
from ..utils import find_gitignore_files, get_ignore_spec, get_files


@click.command()
@click.argument('paths', nargs=-1, type=click.Path())
def build(paths):
    """Builds an output.jsonp ready to ingest into the API"""

    start_time = time.time()
    os.makedirs('.enhancedocs', exist_ok=True)

    output_file_path = os.path.join('.enhancedocs', 'output.jsonp')

    def read_file(file):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            return {'source': file, 'content': content}
        except UnicodeDecodeError:
            return None

    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        for path in paths:
            gitignore_files = find_gitignore_files(path)
            ignore_spec = get_ignore_spec(gitignore_files)
            files = get_files(path, ignore_spec)
            for file in files:
                file_data = read_file(file)
                if file_data is not None:
                    output_file.write(json.dumps(file_data) + '\n')

    elapsed_time = timedelta(seconds=time.time() - start_time)  # Calculate the elapsed time
    click.echo(f"🔨 Build finished in  {elapsed_time.total_seconds():.4f}s")
