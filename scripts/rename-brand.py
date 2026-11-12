"""One-off brand rename: Deadbolt Nation Locksmiths -> Deadbolt Fixers.
Usage: python scripts/rename-brand.py [files...]   (no args = whole repo, excluding node_modules/dist/.git)
"""
import os, sys

PAIRS = [
    ('Deadbolt Nation Locksmiths LLC', 'Deadbolt Fixers LLC'),
    ('DEADBOLT NATION LOCKSMITHS', 'DEADBOLT FIXERS'),
    ('Deadbolt Nation Locksmiths', 'Deadbolt Fixers'),
    ('Deadbolt Nation Locksmith', 'Deadbolt Fixer'),
    ('DEADBOLT NATION', 'DEADBOLT FIXERS'),
    ('Deadbolt Nation', 'Deadbolt Fixers'),
    ('deadboltnation.com', 'deadboltfixers.com'),
    ('deadbolt-nation', 'deadbolt-fixers'),
]
SKIP = {'node_modules', 'dist', '.git', '.astro', 'lighthouse-reports'}
EXT = ('.md', '.mdx', '.ts', '.mjs', '.js', '.astro', '.css', '.json', '.html', '.htaccess', '.txt')

def files():
    if len(sys.argv) > 1:
        yield from sys.argv[1:]
        return
    for root, dirs, fs in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP]
        for f in fs:
            if f.endswith(EXT) and f != 'rename-brand.py':
                yield os.path.join(root, f)

changed = 0
for p in files():
    try:
        t = open(p, encoding='utf8').read()
    except (UnicodeDecodeError, FileNotFoundError):
        continue
    n = t
    for a, b in PAIRS:
        n = n.replace(a, b)
    if n != t:
        open(p, 'w', encoding='utf8', newline='\n').write(n)
        changed += 1
        print('renamed:', p)
print(f'{changed} files changed')
