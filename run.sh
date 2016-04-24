#!/bin/bash

cat password.txt | openconnect -u jbuchanan30 --authgroup gatech --passwd-on-stdin anyc.vpn.gatech.edu&
sleep 2
gulp
