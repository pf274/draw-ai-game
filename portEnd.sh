#!/bin/bash

# Get the port number as an argument to the script
port=$1

# Get the PID of the process running on the specified port
pid=$(netstat -ano | grep ":$port" | awk '{print $5}' | cut -d ':' -f 2)

# If a PID was found, kill the process
if [ ! -z "$pid" ]; then
  echo "Killing process with PID $pid"
  kill -9 $pid
else
  echo "No process found running on port $port"
fi

read -p "Press any key to exit..."