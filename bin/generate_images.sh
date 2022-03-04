#!/bin/sh -e
root_dir="$(git rev-parse --show-toplevel)"

file_dir=$root_dir$1*

for FILE in $file_dir; do
  if [[ $FILE == *.mmd ]]
  then
    mmdc -i $FILE -o "${FILE/mmd/svg}"
  fi
done
