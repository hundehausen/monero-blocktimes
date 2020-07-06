# monero-blocktimes

## German

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
