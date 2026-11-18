"""Generate self-hosted static Latin fonts and content-specific CJK subsets.
Run: uv run --with 'fonttools[woff]' python scripts/subset-fonts.py
"""
import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.merge import Merger, Options as MergeOptions

root = Path(__file__).resolve().parent.parent
sources = root / 'tmp/font-sources'
output = root / 'public/fonts'
fontsource = root / 'node_modules/@fontsource-variable/noto-sans-sc/files'
sources.mkdir(parents=True, exist_ok=True)
output.mkdir(parents=True, exist_ok=True)
all_text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'src').rglob('*')
                   if p.suffix in {'.astro', '.json', '.md', '.ts'})
wanted = {ord(c) for c in all_text if ord(c) > 0x2FF}

def name_instance(font, script, weight):
    # The disjoint Latin/CJK files need distinct internal names as well as URLs.
    # Some PDF renderers cache embedded fonts by their PostScript name.
    family = f'Portfolio Sans {script}'
    style = 'Regular' if weight == 400 else 'SemiBold'
    names = {1: family, 2: style, 4: f'{family} {style}',
             6: f'PortfolioSans{script}-{style}', 16: family, 17: style}
    for name_id, value in names.items():
        font['name'].removeNames(nameID=name_id)
        font['name'].setName(value, name_id, 3, 1, 0x409)

for weight in (400, 600):
    latin = instantiateVariableFont(TTFont(fontsource / 'noto-sans-sc-latin-wght-normal.woff2'),
                                   {'wght': weight}, inplace=True, updateFontNames=True)
    latin.flavor = 'woff2'
    name_instance(latin, 'Latin', weight)
    latin.save(output / f'noto-sans-latin-{weight}.woff2')

    family = 'noto-sans-sc' if weight == 400 else 'noto-sans-sc-600'
    parts = []
    digest = hashlib.sha256()
    for index, part in enumerate(sorted(fontsource.glob('*-wght-normal.woff2'))):
        candidate = TTFont(part)
        keep = wanted & set(candidate.getBestCmap())
        if not keep:
            continue
        digest.update(part.read_bytes())
        candidate = instantiateVariableFont(candidate, {'wght': weight}, inplace=True, updateFontNames=True)
        small = subset.Subsetter()
        small.populate(unicodes=keep)
        small.subset(candidate)
        candidate.flavor = None
        part_path = sources / f'{family}-part-{index}.ttf'
        candidate.save(part_path)
        parts.append(str(part_path))
    merge_options = MergeOptions()
    merge_options.drop_tables = ['BASE', 'STAT', 'GSUB', 'GPOS', 'GDEF']
    font = Merger(options=merge_options).merge(parts)
    unicodes = sorted(wanted & set(font.getBestCmap()))
    options = subset.Options()
    options.flavor = 'woff2'
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    name_instance(font, 'CJK', weight)
    font.flavor = 'woff2'
    destination = output / f'{family}-site.woff2'
    font.save(destination)
    print(f'{family}: {len(unicodes)} characters, {destination.stat().st_size:,} bytes')
    (output / f'{family}-coverage.json').write_text(json.dumps({
        'family': family, 'sourceSha256': digest.hexdigest(),
        'characters': ''.join(chr(c) for c in unicodes)
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
