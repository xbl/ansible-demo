#!/bin/bash

index=0

for file in $(ls -tl | grep '^d' | awk '{ print $9 }')
do
    if [ $index -eq 1 ]
    then
        echo "$file"
        break
    fi
    let "index++"
done

