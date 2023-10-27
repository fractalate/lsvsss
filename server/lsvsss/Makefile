# This Makefile script exists for the clean target which cleans up ploom data
# files and stats that are created during development.

.PHONY: all
all:
	# Use "make ploom-clean" or "make stats-clean" to clean up those files.
	# Use "make clean" to clean up both.

.PHONY: ploom-clean
ploom-clean:
	rm -rf __ploom_*.dat

.PHONY: stats-clean
stats-clean:
	rm -rf __stats_*.dat

.PHONY: clean
clean: ploom-clean stats-clean
