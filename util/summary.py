#!/usr/bin/env python3

import json
from dateutil.parser import parse
import sys

if len(sys.argv) != 2:
    print("Usage: %s /path/to/data/dump.json", sys.argv[0], file=sys.stderr)

timeseries = {}

f = open(sys.argv[1])
json_obj = json.load(f)
for building_id in json_obj:
    if building_id not in timeseries:
        timeseries[building_id] = []

    for date in json_obj[building_id]:
        unique = json_obj[building_id][date]['total']['count_users_unique']
        timeseries[building_id].append({'date': date, 'count': unique})

# sort by date
for building_id in timeseries:
    series = timeseries[building_id]
    series.sort(key=lambda p: parse(p['date']))

if False:
    with open("timeseries.json", "w") as outfile:
        json.dump(timeseries, outfile, indent=4)

max_count = {}

import numpy as np

for building_id in timeseries:
    # max_count[building_id] = max(timeseries[building_id], key=lambda p: p['count'])['count']

    a = np.array([p['count'] for p in timeseries[building_id]])
    p = np.percentile(a, 50)
    max_count[building_id] = p

with open("max.json", "w") as outfile:
    json.dump(max_count, outfile, indent=4)
