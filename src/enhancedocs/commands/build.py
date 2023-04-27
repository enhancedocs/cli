import os
import click
import json

from ..utils import get_files


@click.command()
@click.argument('paths', nargs=-1, type=click.Path())
def build(paths):
    """Builds an output.jsonp ready to ingest into the API"""
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
            files = get_files(path)
            for file in files:
                file_data = read_file(file)
                if file_data is not None:
                    output_file.write(json.dumps(file_data) + '\n')

    return True
