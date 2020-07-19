# monero-blocktimes

## German

### blocktime_calc.js and blocktime_calc_remote.js

Dieses Script holt sich von einem Monero Node mit aktiviertem JSON RPC
die letzten n Blöcke und berechnet deren Zeitdifferenz.
Der Timestamp wird in jedem Block vom Miner selbst festgelegt. Hierbei
kommt es zu Abweichungen, da die Miner keine gemeinsame synchronisierte
Systemzeit nutzen.
Das Monero Netzwerk lehnt den Block ab, wenn der Timestamp größer als
die Median Blockdauer der letzten 60 Blöcke ist.
siehe: https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L1691
und https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L3611
Aufgrundessen kommt es unvermeidlich zu unkorrekten Ergebnissen bei diesem
Programm, allerdings kann die Abweichung nicht größer als die Median Blockzeit
der letzten 60 Blöcke sein. Die Werte dienen somit nur als Richtwerte.

### block_notify.js

Dieses Script wird von der Flag --block-notify von monerod aufgerufen,
sobald der Monero einen neuen Block empfängt. Das Script speichert die
Blockhöhe und den aktuellen Unix-Timestamp von dem System auf dem es läuft.
Diese Methode ist genauer, eine Abweichung entsteht nur durch die Latenz
des Netzwerkes.

#### Nutzung

    ./monerod --block-notify="/usr/bin/node /home/user/monero-blocktimes/block_notify.js %s"

oder in der Konfigurationsdatei:

    block-notify=/usr/bin/node /home/user/monero-blocktimes/block_notify.js %s

## English

### blocktime_calc.js and blocktime_calc_remote.js

These scripts fetch the last n bolcks from a local monero node or from
moneroblocks.info. The timestamp in the blockchain comes from the miner
that mines the block. The system times from all miners are not synchronised
so it is possible that a newer block has a timestamp from the past.
The limit for the time difference in the past is calculated from the median
blocktime from the last 60 blocks. See https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L1691
and https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L3611
As a conclusion you can not get clear results.

### block_notify.js

This scripts get executed from the flag --block-notify of monerod, as soon
as the monero daemon recieves a new block from the network. The script
saves the blockheight with the unix-timestamp of the system it is running on.
This is much more precise, because you only get the latency of the monero network.

#### Usage

    ./monerod --block-notify="/usr/bin/node /home/user/monero-blocktimes/block_notify.js %s"

or in the config file:

    block-notify=/usr/bin/node /home/user/monero-blocktimes/block_notify.js %s
