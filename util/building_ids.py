import json
import sys

"""
Extracts building id, name pairs from the large historical dataset
"""

buildings = {}
with open(sys.argv[1], 'r') as f:
    obj = json.load(f)
    for ap in obj['AccessPoints']:
        buildings[ap['building_id']] = ap['building_name']

with open('buildings.json', 'w') as f:
    json.dump(buildings, f, indent=4)
