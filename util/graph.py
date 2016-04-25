#!/usr/bin/env python3

# uses 
import matplotlib.pyplot as plt
import json
from dateutil.parser import parse

with open('timeseries.json') as f:
    data = json.load(f)

    culc = data['166']

for p in culc:
    p['date'] = parse(p['date'])

# culc.sort(key=lambda p: p['date'])

counts = [p['count'] for p in culc]
dates = [p['date'] for p in culc]

plt.plot(dates, counts)
plt.ylabel('culc')
plt.show()
